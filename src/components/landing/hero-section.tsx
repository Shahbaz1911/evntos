
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CalendarPlus, Users } from 'lucide-react';

export default function HeroSection() {
  return (
    <section id="hero" className="bg-secondary text-secondary-foreground py-20 md:py-32">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text Content */}
        <div className="space-y-8 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight text-primary">
            Host Unforgettable Events, <span className="block">Effortlessly.</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-xl mx-auto md:mx-0">
            Eventos provides the tools you need to create, promote, and manage any event with ease. From meetups to conferences, make your next event a stunning success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform">
              <Link href="/signup">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/10 shadow-md">
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-muted-foreground pt-4">
            <div className="flex items-center">
              <CalendarPlus className="h-5 w-5 mr-2 text-primary/70" />
              <span>Easy Event Creation</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary/70" />
              <span>Seamless Management</span>
            </div>
          </div>
        </div>

        {/* Right Column: Image/Visual */}
        <div className="relative group">
           <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <Card className="relative overflow-hidden shadow-2xl rounded-xl border-2 border-transparent hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-0">
              <Image
                src="https://placehold.co/800x600.png"
                alt="Dynamic Event Showcase"
                width={800}
                height={600}
                className="rounded-xl object-cover aspect-[4/3]"
                priority
                data-ai-hint="event collage celebration"
              />
            </CardContent>
          </Card>
        </div>
      </div>
       <style jsx global>{`
        .animate-tilt {
          animation: tilt 10s infinite linear;
        }
        @keyframes tilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(0.5deg); }
          75% { transform: rotate(-0.5deg); }
        }
      `}</style>
    </section>
  );
}
