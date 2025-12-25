
"use client";

import { Pricing } from "@/components/blocks/pricing";

const pagePlans = [
  {
    name: "Free",
    price: "0",
    yearlyPrice: "0",
    period: "per month",
    features: [
      "Create up to 1 event",
      "Basic guest list management",
      "Standard event page customization",
      "Community support",
    ],
    description: "Perfect for getting started and exploring core features.",
    buttonText: "Get Started Free",
    href: "/signup",
    isPopular: false,
  },
  {
    name: "Pro",
    price: "29",
    yearlyPrice: "23",
    period: "per month",
    features: [
      "Unlimited events",
      "Advanced guest management",
      "QR code ticketing & scanning",
      "SEO-friendly event slugs",
      "Email support",
    ],
    description: "For growing events and professional organizers.",
    buttonText: "Choose Pro",
    href: "/checkout/Pro",
    isPopular: true,
  },
  {
    name: "Business",
    price: "79",
    yearlyPrice: "63",
    period: "per month",
    features: [
      "All Pro features",
      "Team collaboration tools",
      "Advanced analytics",
      "Custom branding options",
      "Priority support",
    ],
    description: "Comprehensive solutions for large scale events.",
    buttonText: "Choose Business",
    href: "/checkout/Business",
    isPopular: false,
  },
];


export default function PricingSection() {
  return (
    <section id="pricing" className="bg-background text-foreground overflow-x-clip relative z-10">
      <Pricing 
        plans={pagePlans}
        title="Simple, Transparent Pricing"
        description="Choose the plan that works for you. No hidden fees.
All plans include access to our platform and dedicated support."
      />
    </section>
  );
}
