
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarPlus, Users } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwcGFydHl8ZW58MHx8fHwxNzUyMjYyMzUxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    hint: "concert party",
  },
  {
    src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
    hint: "festival crowd",
  },
];

const ScrambledText = ({ children, className, speed = 2 }: { children: string, className?: string, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState(children);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const scramble = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let iteration = 0;
    const originalText = children;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{};:,./<>?';

    intervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        if(intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      
      const newText = originalText
        .split('')
        .map((letter, index) => {
          if (letter === ' ') return ' ';
          if (index < iteration) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      
      setDisplayedText(newText);

      if (iteration >= originalText.length) {
        if(intervalRef.current) clearInterval(intervalRef.current);
      }
      
      iteration += 1 / speed;
    }, 30);
  }, [children, speed]);

  useEffect(() => {
    isMountedRef.current = true;
    scramble();
    
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [scramble]);

  return <span onMouseEnter={scramble} className={className}>{displayedText}</span>;
};

export default function HeroSection() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const image1Opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const image1Scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.9]);
  
  const image2Opacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);
  const image2Scale = useTransform(scrollYProgress, [0.4, 0.8], [0.9, 1]);

  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-50%"]);

  return (
    <section id="hero" ref={targetRef} className="relative h-[200vh] bg-black">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images Container */}
        <div className="absolute inset-0 z-0">
          <motion.div
            style={{ opacity: image1Opacity, scale: image1Scale }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[0].src}
              alt="A vibrant concert with a cheering crowd"
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImages[0].hint}
            />
          </motion.div>
          <motion.div
            style={{ opacity: image2Opacity, scale: image2Scale }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[1].src}
              alt="An outdoor festival with many people enjoying the music"
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImages[1].hint}
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Foreground Content */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-10 container mx-auto px-4 text-center"
        >
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight text-white">
              Host <span className="inline-block min-h-[1.2em] bg-gradient-to-r from-indigo-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                <ScrambledText>Unforgettable</ScrambledText>
              </span> Events, <span className="block">Effortlessly.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
              <ScrambledText speed={0.5}>
                Evntos provides the tools you need to create, promote, and manage any event with ease. From meetups to conferences, make your next event a stunning success.
              </ScrambledText>
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
      </div>
    </section>
  );
}
