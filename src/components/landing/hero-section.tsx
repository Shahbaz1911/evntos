"use client";

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const heroImage = {
    src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
    hint: "festival crowd",
};

export default function HeroSection() {
    const targetRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start start', 'end start']
    });

    // The scale animation should happen over the first part of the scroll
    const scale = useTransform(scrollYProgress, [0, 0.8], [1, 50]);
    // The mask opacity should fade out towards the end of its animation
    const maskOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);
    // This will make the underlying hero content fade in as the mask scales up
    const contentOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    return (
        <section id="hero" ref={targetRef} className="relative h-[300vh] bg-black -mt-16">
            <div className="sticky top-0 h-screen">
                {/* 1. The underlying Hero Content, revealed by the mask */}
                <motion.div className="absolute inset-0 z-0" style={{ opacity: contentOpacity }}>
                     <Image
                      src={heroImage.src}
                      alt="A vibrant festival crowd"
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                      data-ai-hint={heroImage.hint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 z-10" />

                    <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                        <div className="space-y-6 md:space-y-8">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight">
                                Welcome to evntos,
                                <span className="block md:inline-block">Host Events Effortlessly.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
                                Evntos provides the tools you need to create, promote, and manage any event with ease.
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
                        </div>
                    </div>
                </motion.div>

                {/* 2. The Masking Layer */}
                <motion.div 
                    className="absolute inset-0 z-10 bg-black flex items-center justify-center"
                    style={{ opacity: maskOpacity }}
                >
                    <motion.h1
                        style={{ scale }}
                        className="text-white text-6xl md:text-8xl lg:text-9xl font-bold text-center mix-blend-screen font-headline"
                    >
                        evntos
                    </motion.h1>
                </motion.div>
            </div>
        </section>
    );
}