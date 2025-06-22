"use client";

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const heroImages = [
    {
        src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "festival crowd",
        alt: "A vibrant festival crowd enjoying a concert",
    },
    {
        src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjb25jZXJ0JTIwbGlnaHRzfGVufDB8fHx8MTc1MjI2NTg0Mnww&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "concert lights",
        alt: "Bright stage lights at a music concert",
    },
    {
        src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxkal9tdXNpY3xlbnwwfHx8fDE3NTIyNjU4ODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "dj music",
        alt: "A DJ performing on stage for a large crowd",
    }
];

export default function HeroSection() {
    const heroRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            const images = imagesRef.current;
            if (images.length < 2) return;

            gsap.set(images, { autoAlpha: 0 });
            gsap.set(images[0], { autoAlpha: 1 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top top",
                    end: "+=200%", 
                    scrub: true,
                    pin: true,
                    anticipatePin: 1
                }
            });

            tl.to(images[0], { autoAlpha: 0, duration: 1, ease: 'power1.inOut' })
              .to(images[1], { autoAlpha: 1, duration: 1, ease: 'power1.inOut' }, "-=0.5");

            tl.to(images[1], { autoAlpha: 0, duration: 1, ease: 'power1.inOut' }, "+=1")
              .to(images[2], { autoAlpha: 1, duration: 1, ease: 'power1.inOut' }, "-=0.5");
              
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="hero" ref={heroRef} className="relative h-screen bg-black overflow-hidden">
            <div className="absolute inset-0">
                {heroImages.map((image, index) => (
                    <div
                        key={image.src}
                        ref={el => { if(el) imagesRef.current[index] = el; }}
                        className="hero-image absolute inset-0 invisible"
                    >
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority={index === 0}
                            data-ai-hint={image.hint}
                        />
                    </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
            </div>

            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                <div className="space-y-6 md:space-y-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight drop-shadow-lg">
                        Welcome to evntos, Host Events Effortlessly
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
        </section>
    );
}
