
"use client";

import PricingSection from '@/components/landing/pricing-section';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DedicatedPricingPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-4xl mx-auto shadow-xl border border-border">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-primary">
            Choose Your Plan
          </CardTitle>
          <CardDescription className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your event management needs. You can upgrade or change your plan anytime.
          </CardDescription>
        </CardHeader>
        {/* PricingSection already has its own container & padding, so we don't double it here unnecessarily */}
      </Card>
      <PricingSection />
    </div>
  );
}
