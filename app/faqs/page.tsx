import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50/50">
      <EcommerceHeader />

      {/* Main FAQ Content */}
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-3xl">
          {/* FAQ Header */}
          <div className="mb-10 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#E87A3F] sm:text-5xl">
              FAQs
            </h1>
            <p className="text-lg text-gray-600">
              Quick answers to common questions — all in one place.
            </p>
          </div>

          {/* FAQ Items - Stacked Rectangular Boxes */}
          <div className="mb-16">
            <Accordion type="single" collapsible className="space-y-4">
              {faqData.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-lg border border-gray-200 bg-white px-6 shadow-sm transition-all hover:shadow-md"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-[#E87A3F] hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Still Have Questions Section */}
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200 sm:p-12">
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Still have questions?
            </h2>
            <p className="mb-8 text-gray-600">
              No worries — chat with us live or email us anytime.
            </p>
            <Link href="/contact-us">
              <Button className="h-12 rounded-full bg-[#E87A3F] px-8 text-base font-semibold text-white transition-colors hover:bg-[#d96d34]">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
