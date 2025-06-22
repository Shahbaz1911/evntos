
"use client";

import { useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroSection() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start']
    });

    // Text animation for the first 40% of the scroll
    const textScale = useTransform(scrollYProgress, [0, 0.4], [1, 50]);
    // Fade out text between 40% and 50%
    const textOpacity = useTransform(scrollYProgress, [0.4, 0.5], [1, 0]);

    // Fade in hero content between 50% and 70%
    const heroContentOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);

    return (
        <section ref={heroRef} className="relative h-[200vh] bg-background">
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
                {/* The Intro Text */}
                <motion.div
                    style={{ opacity: textOpacity, scale: textScale }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <h1 className="text-primary text-6xl md:text-9xl font-bold font-headline">
                        evntos
                    </h1>
                </motion.div>

                {/* The Hero Content */}
                <motion.div 
                    style={{ opacity: heroContentOpacity }}
                    className="absolute inset-0 w-full h-full"
                >
                    <Image
                        src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="A vibrant festival crowd enjoying a concert"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                        className="z-0"
                        data-ai-hint="festival crowd"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10 z-10" />
                    <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                        <div className="space-y-6 md:space-y-8">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight drop-shadow-lg">
                                Host Events, Reimagined
                            </h1>
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
            </div>
        </section>
    );
}
