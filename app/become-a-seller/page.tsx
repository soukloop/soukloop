'use client'

import BecomeSellerCTA from '@/components/become-seller-cta'
import EcommerceHeader from '@/components/ecommerce-header'
import FooterSection from '@/components/footer-section'

export default function BecomeSellerPage() {
    return (
        <main className="min-h-screen bg-white">
            <EcommerceHeader />
            <div className="pt-20"> {/* Offset for fixed header */}
                <BecomeSellerCTA />
            </div>
            <FooterSection />
        </main>
    )
}
