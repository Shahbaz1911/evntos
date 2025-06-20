
"use client";

import HeroSection from '@/components/landing/hero-section';
import AboutSection from '@/components/landing/about-section';
import ServicesSection from '@/components/landing/services-section';
import PricingSection from '@/components/landing/pricing-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import FaqSection from '@/components/landing/faq-section';
import CtaSection from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}

