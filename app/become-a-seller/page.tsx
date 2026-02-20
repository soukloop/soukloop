'use client'

import BecomeSellerCTA from '@/components/become-seller-cta'
import EcommerceHeader from '@/components/ecommerce-header'
import FooterSection from '@/components/footer-section'

export default function BecomeSellerPage() {
    return (
        <main className="min-h-screen bg-white sm:mt-[-13.5rem] mt-[-11.2rem]">
            <EcommerceHeader />
            <div className="pt-20"> {/* Offset for fixed header */}
                <BecomeSellerCTA />
            </div>
            <FooterSection />
        </main>
    )
}
