"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const heroImage = {
    src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
    hint: "festival crowd",
};

export default function HeroSection() {
    const [animationComplete, setAnimationComplete] = useState(false);

    return (
        <section id="hero" className="relative h-screen bg-background -mt-16 pt-16 overflow-hidden">
            <AnimatePresence>
                {!animationComplete && (
                    <motion.div
                        key="animation-overlay"
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                        onAnimationComplete={() => setAnimationComplete(true)}
                    >
                        <motion.h1
                            className="text-6xl md:text-8xl lg:text-9xl font-bold font-headline text-white"
                            style={{ mixBlendMode: 'screen' }}
                            initial={{ scale: 1 }}
                            animate={{ scale: 50, opacity: [1, 1, 0] }}
                            transition={{ duration: 2.5, ease: 'easeIn', times: [0, 0.9, 1] }}
                        >
                            evntos
                        </motion.h1>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The actual hero content, which will be revealed through the mask */}
            <div className="relative h-full">
                <div className="absolute inset-0">
                    <Image
                      src={heroImage.src}
                      alt="A vibrant festival crowd"
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                      data-ai-hint={heroImage.hint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
                </div>

                <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    {/* The content fades in after the mask animation is gone */}
                    <motion.div
                        className="space-y-6 md:space-y-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: animationComplete ? 1 : 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight">
                            Welcome to evntos, Host Events Effortlessly
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-white/90 max-w-xl mx-auto">
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
