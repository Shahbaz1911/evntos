
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const heroImage = {
    src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
    hint: "festival crowd",
};

const wordsToAnimate = ["Effortlessly", "Beautifully", "Successfully", "Creatively"];
const typingSpeed = 150;
const deletingSpeed = 75;
const delayAfterTyping = 2000;

export default function HeroSection() {
    const [isLoading, setIsLoading] = useState(true);
    const [wordIndex, setWordIndex] = useState(0);
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // This will remove the splash screen after the animation sequence
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500); // Total duration of the splash screen

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Don't start typing until the splash screen is gone
        if (isLoading) return;

        const handleTyping = () => {
            const currentWord = wordsToAnimate[wordIndex];
            const updatedText = isDeleting
                ? currentWord.substring(0, text.length - 1)
                : currentWord.substring(0, text.length + 1);

            setText(updatedText);

            if (!isDeleting && updatedText === currentWord) {
                // Pause at end of word before starting to delete
                setTimeout(() => setIsDeleting(true), delayAfterTyping);
            } else if (isDeleting && updatedText === "") {
                setIsDeleting(false);
                setWordIndex((prev) => (prev + 1) % wordsToAnimate.length);
            }
        };

        const timeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

        return () => clearTimeout(timeout);
    }, [text, isDeleting, wordIndex, isLoading]);

    return (
        <section id="hero" className="relative h-screen bg-background -mt-16 pt-16">
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        className="absolute inset-0 z-50 flex items-center justify-center"
                        initial={{ backgroundColor: '#000000' }}
                        animate={{ backgroundColor: '#fff7ed' }} // This is the creamy white from globals.css
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                    >
                        <motion.h1
                            className="text-6xl md:text-8xl lg:text-9xl font-bold font-headline text-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: "circIn" }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.5 } }}
                        >
                            evntos
                        </motion.h1>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The actual hero content, which will be revealed */}
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
                    <div className="space-y-6 md:space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
                            transition={{ duration: 0.8, delay: isLoading ? 0 : 0.2 }}
                        >
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight">
                                Welcome to evntos,
                                <span className="block md:inline-block">
                                    Host Events{' '}
                                    <span className="relative inline-block h-[1.2em]">
                                      <span className="bg-gradient-to-r from-fuchsia-500 via-red-500 to-orange-400 bg-clip-text text-transparent">
                                          {text}
                                      </span>
                                      <span className="ml-1 inline-block h-full w-[2px] animate-pulse bg-white/70" aria-hidden="true"></span>
                                    </span>
                                </span>
                            </h1>
                            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-xl mx-auto">
                                Evntos provides the tools you need to create, promote, and manage any event with ease.
                            </p>
                        </motion.div>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
                            transition={{ duration: 0.8, delay: isLoading ? 0 : 0.4 }}
                        >
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
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
