
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

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
    const timer = setTimeout(handleTyping, isDeleting ? DELETING_SPEED : TYPING_SPEED);
    return () => clearTimeout(timer);
  }, [handleTyping, isDeleting, text]);


  return (
    <section id="hero" className="bg-secondary text-secondary-foreground py-20 md:py-32">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text Content */}
        <div className="space-y-6 md:space-y-8 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight text-primary">
            Host <span className="inline-block min-h-[1.2em] min-w-[200px] sm:min-w-[300px] md:min-w-[350px] lg:min-w-[400px]">{text}</span> Events, <span className="block">Effortlessly.</span>
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
              <Link href="#services"> {/* Changed from #features to #services to match existing link */}
                Learn More
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground pt-4">
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
           <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <Card className="relative overflow-hidden shadow-2xl rounded-xl border-2 border-transparent hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-0">
              <Image
                src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwYXJ0eXxlbnwwfHx8fDE3NTAyNjM5NTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Dynamic Event Showcase"
                width={800}
                height={600}
                className="rounded-xl object-cover aspect-[4/3]"
                priority
                data-ai-hint="party celebration"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
