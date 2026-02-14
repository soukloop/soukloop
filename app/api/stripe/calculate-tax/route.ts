
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items, address, shipping } = await req.json();

        if (!items?.length || !address) {
            return NextResponse.json({ error: 'Missing items or address' }, { status: 400 });
        }

        // Map items to Stripe Tax Calculation line items
        const line_items = items.map((item: any) => ({
            amount: Math.round(item.price * 100), // cents
            reference: item.productId || item.id, // Fallback to item.id if productId missing
            tax_behavior: 'exclusive',
            quantity: item.quantity,
        }));

        // Add shipping as a line item if applicable
        if (shipping > 0) {
            line_items.push({
                amount: Math.round(shipping), // already in cents from frontend? verify. Usually passed as cents.
                reference: 'shipping',
                tax_behavior: 'exclusive',
                quantity: 1,
            });
        }

        // Validate address fields
        const country = (address.country && address.country.toLowerCase() === 'pakistan') ? 'PK' : (address.country || 'US');
        const postal_code = address.postalCode || '00000'; // Default if missing to prevent crash, though Stripe might reject invalid
        const state = address.state || '';
        const city = address.city || '';
        const line1 = address.address1 || '';


        /* 
        // Tax calculation disabled per user request (missing head office address)
        const calculation = await stripe.tax.calculations.create({
            currency: 'usd',
            line_items,
            customer_details: {
                address: {
                    line1,
                    city,
                    state,
                    postal_code,
                    country,
                },
                address_source: 'shipping',
            },
            expand: ['line_items'],
        });

        return NextResponse.json({
            taxAmount: calculation.tax_amount_exclusive, // Amount in cents
            taxDate: calculation.tax_date,
        });
        */

        // Return 0 tax immediately
        return NextResponse.json({
            taxAmount: 0,
            taxDate: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('Stripe Tax Calculation Error:', error);

        // Handle specific error about missing head office address in test mode
        if (error?.type === 'StripeInvalidRequestError' && error?.message?.includes('head office address')) {
            console.warn('Stripe Tax: Missing head office address in dashboard. Returning 0 tax.');
            return NextResponse.json({
                taxAmount: 0,
                taxDate: new Date().toISOString(),
                warning: 'Tax calculation disabled: Missing head office address in Stripe settings.'
            });
        }

        console.error('Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return NextResponse.json(
            { error: error.message || 'Failed to calculate tax' },
            { status: 500 }
        );
    }
}
