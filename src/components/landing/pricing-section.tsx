
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, DollarSign, Star, Zap } from 'lucide-react';

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    frequency: "/month",
    description: "Perfect for getting started and exploring core features.",
    features: [
      "Create up to 3 events",
      "Basic guest list management",
      "Standard event page customization",
      "Community support",
    ],
    buttonText: "Get Started Free",
    buttonLink: "/signup",
    icon: DollarSign,
    mostPopular: false,
    highlightClass: "border-border",
  },
  {
    name: "Pro",
    price: "$29",
    frequency: "/month",
    description: "For growing events and professional organizers.",
    features: [
      "Unlimited events",
      "Advanced guest management",
      "QR code ticketing & scanning",
      "SEO-friendly event slugs",
      "Email support",
    ],
    buttonText: "Choose Pro",
    buttonLink: "/signup?plan=pro",
    icon: Zap,
    mostPopular: true,
    highlightClass: "border-primary shadow-lg ring-2 ring-primary",
  },
  {
    name: "Business",
    price: "$79",
    frequency: "/month",
    description: "Comprehensive solutions for large scale events.",
    features: [
      "All Pro features",
      "Team collaboration tools",
      "Advanced analytics",
      "Custom branding options",
      "Priority support",
    ],
    buttonText: "Contact Sales",
    buttonLink: "/contact",
    icon: Star,
    mostPopular: false,
    highlightClass: "border-border",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-background text-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Pricing Plans
          </h2>
          <p className="text-3xl md:text-4xl font-bold font-headline">
            Choose the Right Plan for You
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent pricing. No hidden fees. Get started for free or upgrade for more power and features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className={`flex flex-col ${tier.highlightClass} rounded-xl`}>
              <CardHeader className="text-center p-6">
                <div className="mb-4">
                  <tier.icon className={`w-12 h-12 mx-auto ${tier.mostPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <CardTitle className="font-headline text-2xl text-foreground">{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-primary">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.frequency}</span>
                </div>
                <CardDescription className="mt-3 text-muted-foreground text-sm min-h-[40px]">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-6 space-y-3">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-foreground/90">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 mt-auto">
                <Button 
                  asChild 
                  size="lg" 
                  className={`w-full ${tier.mostPopular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'}`}
                >
                  <Link href={tier.buttonLink}>{tier.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
