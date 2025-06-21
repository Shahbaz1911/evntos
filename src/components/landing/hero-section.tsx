
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CalendarPlus, Users } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

const wordsToAnimate = ["Unforgettable", "Amazing", "Successful"];
const TYPING_SPEED = 120;
const DELETING_SPEED = 70;
const DELAY_BETWEEN_WORDS = 1500;
const IMAGE_CHANGE_INTERVAL = 4000; // 4 seconds

const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwcGFydHl8ZW58MHx8fHwxNzUyMjYyMzUxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    hint: "concert party",
  },
  {
    src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
    hint: "festival crowd",
  },
  {
    src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxkbSUyMHBhcnR5fGVufDB8fHx8MTc1MjI2MjQxNnww&ixlib=rb-4.1.0&q=80&w=1080",
    hint: "dj party",
  },
];

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleTyping = useCallback(() => {
    const currentWord = wordsToAnimate[wordIndex];
    if (isDeleting) {
      setText((prev) => prev.substring(0, prev.length - 1));
    } else {
      setText((prev) => currentWord.substring(0, prev.length + 1));
    }

    if (!isDeleting && text === currentWord) {
      setTimeout(() => setIsDeleting(true), DELAY_BETWEEN_WORDS);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % wordsToAnimate.length);
    }
  }, [isDeleting, text, wordIndex]);

  useEffect(() => {
    const typingTimer = setTimeout(handleTyping, isDeleting ? DELETING_SPEED : TYPING_SPEED);
    return () => clearTimeout(typingTimer);
  }, [handleTyping, isDeleting, text]);

  useEffect(() => {
    const imageTimer = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, IMAGE_CHANGE_INTERVAL);
    return () => clearInterval(imageTimer);
  }, []);

  return (
    <section id="hero" className="relative md:bg-secondary text-secondary-foreground py-20 md:py-32 overflow-hidden">
        {/* Mobile background image and overlay */}
        <div className="md:hidden absolute inset-0 z-0">
            <Image
                src={heroImages[currentImageIndex].src}
                alt="Event background"
                fill
                className="object-cover"
                priority
                key={currentImageIndex} // Add key to make image transition
                data-ai-hint={heroImages[currentImageIndex].hint}
            />
            <div className="absolute inset-0 bg-black/50" />
        </div>

      <div className="relative z-10 container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text Content */}
        <div className="space-y-6 md:space-y-8 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight text-white md:text-primary">
            Host <span className="inline-block min-h-[1.2em] min-w-[200px] sm:min-w-[300px] md:min-w-[350px] lg:min-w-[400px] bg-gradient-to-r from-primary to-accent md:from-indigo-400 md:via-pink-500 md:to-orange-500 bg-clip-text text-transparent">{text}</span> Events, <span className="block">Effortlessly.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 md:text-foreground/80 max-w-xl mx-auto md:mx-0">
            Evntos provides the tools you need to create, promote, and manage any event with ease. From meetups to conferences, make your next event a stunning success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform">
              <Link href="/signup">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" asChild className="bg-white/20 border border-white/50 text-white hover:bg-white/30 backdrop-blur-sm md:bg-transparent md:border-primary md:text-primary md:hover:bg-primary/10 shadow-md">
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-white/80 md:text-muted-foreground pt-4">
            <div className="flex items-center">
              <CalendarPlus className="h-5 w-5 mr-2 text-white/70 md:text-primary/70" />
              <span>Easy Event Creation</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-white/70 md:text-primary/70" />
              <span>Seamless Management</span>
            </div>
          </div>
        </div>

        {/* Right Column: Image/Visual for Desktop */}
        <div className="hidden md:block relative group">
           <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <Card className="relative overflow-hidden shadow-2xl rounded-xl border-2 border-transparent hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-0">
              <Image
                src={heroImages[currentImageIndex].src}
                alt="Dynamic Event Showcase"
                width={800}
                height={600}
                className="rounded-xl object-cover aspect-[4/3]"
                priority
                key={currentImageIndex} // Add key to make image transition
                data-ai-hint={heroImages[currentImageIndex].hint}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
