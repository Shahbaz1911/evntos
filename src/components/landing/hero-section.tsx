
"use client";

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const splashImages = [
    {
        src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "A vibrant festival crowd enjoying a concert",
        aiHint: "festival crowd"
    },
    {
        src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjb25jZXJ0fGVufDB8fHx8MTc1MjI2ODg4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "A concert with bright lights and a cheering audience",
        aiHint: "concert lights"
    },
    {
        src: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxldmVudCUyMG11c2ljfGVufDB8fHx8MTc1MjI2ODkyNXww&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "People dancing and enjoying a music event outdoors",
        aiHint: "music event"
    }
];

export default function HeroSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const evntosTextRef = useRef<HTMLHeadingElement>(null);
    const heroContentRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<Array<HTMLDivElement | null>>([]);

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const pin = gsap.timeline({
            scrollTrigger: {
                trigger: triggerRef.current,
                start: "top top",
                end: "+=200%", // Pin for the height of 2 viewports
                scrub: 1,
                pin: true,
            }
        });

        // Animation for "evntos" text scaling up and fading out
        pin.to(evntosTextRef.current, {
            scale: 50,
            opacity: 0,
            ease: "power2.in",
        }, 0);

        // Animation for hero content fading in as text fades out
        pin.fromTo(heroContentRef.current, {
            opacity: 0,
        }, {
            opacity: 1,
            ease: "power1.inOut",
        }, "<0.2"); // Start slightly after text animation begins

        // Animation for image transitions
        const images = imageRefs.current.filter(el => el !== null) as HTMLDivElement[];
        if (images.length > 1) {
            pin.to(images[0], { opacity: 0 }, 1);
            pin.to(images[1], { opacity: 1 }, 1);
        }
        if (images.length > 2) {
            pin.to(images[1], { opacity: 0 }, 2);
            pin.to(images[2], { opacity: 1 }, 2);
        }

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <section ref={sectionRef} id="hero" className="relative h-auto bg-background -mt-16">
            <div ref={triggerRef} className="h-screen w-full">
                <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">

                    {/* The Intro Text */}
                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                        <h1 ref={evntosTextRef} className="text-primary text-6xl md:text-9xl font-bold font-headline">
                            evntos
                        </h1>
                    </div>
                    
                    {/* Splash Images Container */}
                    <div className="absolute inset-0 w-full h-full z-0">
                        {splashImages.map((image, index) => (
                           <div
                                key={image.src}
                                ref={el => imageRefs.current[index] = el}
                                className="absolute inset-0 w-full h-full"
                                style={{ opacity: index === 0 ? 1 : 0 }}
                           >
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority={index === 0}
                                    className="z-0"
                                    data-ai-hint={image.aiHint}
                                />
                           </div>
                        ))}
                    </div>

                    {/* The Hero Content */}
                    <div 
                        ref={heroContentRef}
                        className="absolute inset-0 w-full h-full z-20"
                        style={{opacity: 0}}
                    >
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
                    </div>

                </div>
            </div>
        </section>
    );
}
