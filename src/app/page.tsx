
"use client";

import HeroSection from '@/components/landing/hero-section';
import AboutSection from '@/components/landing/about-section';
import ServicesSection from '@/components/landing/services-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import FaqSection from '@/components/landing/faq-section';
import CtaSection from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}

