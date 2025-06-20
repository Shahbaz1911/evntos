
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CtaSection() {
  return (
    <section id="cta" className="bg-background text-foreground">
      <div className="container mx-auto px-4">
        <div className="bg-primary/10 rounded-xl shadow-lg p-10 md:p-16 border border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <Sparkles className="w-12 h-12 text-primary mb-4 mx-auto md:mx-0" />
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-3">
                Ready to Create Amazing Events?
              </h2>
              <p className="text-lg text-foreground/80 max-w-xl">
                Join thousands of organizers who trust Evntos to bring their events to life. 
                Sign up today and experience seamless event management.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button 
                size="lg" 
                asChild 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform px-10 py-6 text-lg"
              >
                <Link href="/signup">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
