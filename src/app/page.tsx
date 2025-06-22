
"use client";

import HeroSection from '@/components/landing/hero-section';
import AboutSection from '@/components/landing/about-section';
import FeaturesSection from '@/components/landing/features-section';
import PricingSection from '@/components/landing/pricing-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import GallerySection from '@/components/landing/gallery-section';
import FaqSection from '@/components/landing/faq-section';
import CtaSection from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <PricingSection />
      <TestimonialsSection />
      <GallerySection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
