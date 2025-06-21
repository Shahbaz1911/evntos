"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarPlus, Users } from 'lucide-react';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const heroImage = {
    src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
    hint: "festival crowd",
};

export default function HeroSection() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Animate the opacity of the initial content (text, buttons)
  // It will be fully visible at the start and fade out by the 20% scroll mark.
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.2], ["0%", "-20%"]);

  // The text with the image mask will scale up significantly.
  // It starts scaling from 20% scroll point and finishes at 80%.
  const scale = useTransform(scrollYProgress, [0.2, 0.8], [1, 20]);
  
  // The masked text itself should fade in as the original text fades out.
  const maskOpacity = useTransform(scrollYProgress, [0.15, 0.25], [0, 1]);

  return (
    <section id="hero" ref={targetRef} className="relative h-[200vh] bg-black">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        
        {/* The main content that is visible at the start */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 container mx-auto px-4 text-center text-white"
        >
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight">
              Host <span className="bg-gradient-to-r from-indigo-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">Unforgettable</span> Events, <span className="block">Effortlessly.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
              Evntos provides the tools you need to create, promote, and manage any event with ease. From meetups to conferences, make your next event a stunning success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform">
                <Link href="/signup">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" asChild className="bg-white/20 border border-white/50 text-white hover:bg-white/30 backdrop-blur-sm shadow-md">
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80 pt-4">
              <div className="flex items-center">
                <CalendarPlus className="h-5 w-5 mr-2 text-white/70" />
                <span>Easy Event Creation</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-white/70" />
                <span>Seamless Management</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The masked text layer that scales up */}
        <motion.div 
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            style={{ opacity: maskOpacity }}
        >
            <motion.h1
                style={{ 
                    scale,
                    backgroundImage: `url(${heroImage.src})`
                }}
                className="text-6xl md:text-8xl lg:text-9xl font-bold font-headline bg-cover bg-center bg-clip-text text-transparent"
            >
                Unforgettable
            </motion.h1>
        </motion.div>

      </div>
    </section>
  );
}
