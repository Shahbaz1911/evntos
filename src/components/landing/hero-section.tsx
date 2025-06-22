
"use client";

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroSection() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end end']
    });

    const scale = useTransform(scrollYProgress, [0, 1], [1, 50]);
    const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0]);
    const heroContentOpacity = useTransform(scrollYProgress, [0, 0.5, 0.8], [0, 0, 1]);
    const heroContentY = useTransform(scrollYProgress, [0, 0.5, 0.8], ["2rem", "2rem", "0rem"]);


    return (
        <section id="hero" ref={heroRef} className="relative h-[300vh] bg-background">
            <div className="sticky top-0 h-screen overflow-hidden">
                {/* The content that will be revealed */}
                <div className="absolute inset-0">
                     <Image
                        src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="A vibrant festival crowd enjoying a concert"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                        data-ai-hint="festival crowd"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
                </div>

                {/* The mask container */}
                <motion.div 
                    style={{ opacity }}
                    className="absolute inset-0 bg-black flex justify-center items-center"
                >
                    <motion.h1 
                        style={{ scale }}
                        className="text-white text-6xl md:text-9xl font-bold font-headline"
                    >
                        evntos
                    </motion.h1>
                </motion.div>

                {/* Masked view */}
                <div 
                    className="absolute inset-0 flex justify-center items-center"
                    style={{
                        maskImage: 'url(#evntos-mask)',
                        WebkitMaskImage: 'url(#evntos-mask)',
                        maskSize: 'auto',
                        WebkitMaskSize: 'auto',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                    }}
                >
                    <svg width="0" height="0" className="absolute">
                        <defs>
                            <mask id="evntos-mask">
                                <rect width="100%" height="100%" fill="white" />
                                <motion.text 
                                    x="50%" 
                                    y="50%" 
                                    dy="0.35em" 
                                    textAnchor="middle" 
                                    style={{ scale }}
                                    className="text-6xl md:text-9xl font-bold font-headline fill-black"
                                >
                                    evntos
                                </motion.text>
                            </mask>
                        </defs>
                    </svg>
                     <Image
                        src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="A vibrant festival crowd enjoying a concert"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                        data-ai-hint="festival crowd"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
                </div>
                
                {/* Final revealed content with fade-in */}
                <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    <motion.div 
                        style={{ opacity: heroContentOpacity, y: heroContentY }}
                        className="space-y-6 md:space-y-8"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight drop-shadow-lg">
                            Host Events Effortlessly
                        </h1>
                         <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
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
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

