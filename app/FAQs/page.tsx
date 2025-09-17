import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Button } from "@/components/ui/button";

const faqData = [
  {
    question: "How does Soukloop work?",
    answer:
      "Soukloop is a marketplace for buying and selling pre-loved fashion. Sellers upload items from their wardrobe, and buyers can shop unique pieces at great prices — all sustainably.",
  },
  {
    question: "Are the clothes new or used?",
    answer:
      "Most of the items are gently used and pre-loved, but you'll also find some new or never-worn pieces with tags. Each listing mentions the exact condition.",
  },
  {
    question: "How do I sell on Soukloop?",
    answer:
      "It's super easy! Just create an account, upload clear photos of your item, add details like size, condition, and price — then publish. We'll handle the rest.",
  },
  {
    question: "How do I know if an item will fit me?",
    answer:
      "We recommend checking the size listed and reading any fit notes in the description. If you're unsure, feel free to message the seller directly for more info!",
  },
  {
    question: "Can I return an item?",
    answer:
      "Since most items are one-of-a-kind and pre-owned, all sales are final. But if something arrives damaged or different from the description, contact us — we've got your back.",
  },
  {
    question: "How is shipping handled?",
    answer:
      "Once you buy something, the seller ships it directly to you. You'll get tracking info so you can follow your order every step of the way.",
  },
  {
    question: "Is it safe to shop on Soukloop?",
    answer:
      "Absolutely. All transactions go through our secure platform, and we're here to support both buyers and sellers every step of the way.",
  },
  {
    question: "How is shipping handled?",
    answer:
      "Once you buy something, the seller ships it directly to you. You'll get tracking info so you can follow your order every step of the way.",
  },
  {
    question: "What if I have a problem with my order?",
    answer:
      "No worries — just reach out to us at support@soukloop.com or start a live chat. We'll help sort things out as quickly as possible.",
  },
  {
    question: "Is there a fee to sell on Soukloop?",
    answer:
      "Listing is free! We only take a small commission when your item sells. It helps keep the platform running and safe for everyone.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      {/* Main FAQ Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* FAQ Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-[#E87A3F] mb-4">FAQs</h1>
          <p className="text-gray-600 text-lg">
            Quick answers to common questions — all in one place.
          </p>
        </div>

        {/* FAQ Items */}
        {/* <div className="space-y-12 mb-20">
          {faqData.map((faq, index) => (
            <div key={index}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="lg:pr-8">
                  <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">{faq.question}</h3>
                </div>
                <div className="lg:pl-8">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
              {index < faqData.length - 1 && <div className="border-b border-gray-200 mt-12"></div>}
            </div>
          ))}
        </div> */}

        <div className="space-y-12 mb-20">
          {faqData.map((faq, index) => (
            <div key={index}>
              <div className="grid grid-cols-2 gap-8 items-start">
                <div className="pr-8">
                  <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
                    {faq.question}
                  </h3>
                </div>
                <div className="pl-8">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
              {index < faqData.length - 1 && (
                <div className="border-b border-gray-200 mt-12"></div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions Section */}
        <div className="bg-white py-12">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              No worries — chat with us live or email us anytime.
            </p>
            <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white text-base font-semibold w-[200px] h-[56px] rounded-[8px]">
              Contact Us
            </Button>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
