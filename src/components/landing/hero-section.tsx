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
        src: "https://media-alpha-green.vercel.app/evnto/event.jpg",
        alt: "Vibrant outdoor social event with people relaxing by a pool.",
        aiHint: "social event"
    },
    {
        src: "https://media-alpha-green.vercel.app/evnto/event-1.jpg",
        alt: "Group of friends celebrating at a dinner party with festive lights.",
        aiHint: "event celebration"
    },
    {
        src: "https://media-alpha-green.vercel.app/evnto/even-5.jpg",
        alt: "Crowd watching a spectacular fireworks display at an outdoor festival.",
        aiHint: "outdoor festival"
    },
    {
        src: "https://media-alpha-green.vercel.app/evnto/event-3.jpg",
        alt: "A speaker on stage giving a presentation at a large conference.",
        aiHint: "conference presentation"
    },
    {
        src: "https://media-alpha-green.vercel.app/evnto/event-6.jpg",
        alt: "An engaged audience sitting in a dark theater, lit by the stage.",
        aiHint: "event audience"
    }
];

export default function HeroSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const evntosTextRef = useRef<HTMLHeadingElement>(null);
    const heroContentRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<Array<HTMLDivElement | null>>([]);
    const whiteBgRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const pin = gsap.timeline({
            scrollTrigger: {
                trigger: triggerRef.current,
                start: "top top",
                end: "+=500%", // Adjusted for the extra animation step
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
        
        // At the same time, fade out the initial white background
        pin.to(whiteBgRef.current, {
            opacity: 0,
            ease: "power1.inOut",
        }, "<");

        // Animation for hero content fading in as text fades out
        pin.fromTo(heroContentRef.current, {
            opacity: 0,
        }, {
            opacity: 1,
            ease: "power1.inOut",
        }, "<0.5");

        // Animation for image transitions
        const images = imageRefs.current.filter(el => el !== null) as HTMLDivElement[];
        if (images.length > 1) {
            // Start transitions from the second image
            for (let i = 1; i < images.length; i++) {
                // Add an offset to account for the initial fade-in duration
                const position = i + 0.5;
                pin.to(images[i - 1], { opacity: 0 }, position); // Fade out previous image
                pin.to(images[i], { opacity: 1 }, position);   // Fade in current image
            }
        }

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <section ref={sectionRef} id="hero" className="relative h-auto -mt-[var(--header-height,0px)]">
            <div ref={triggerRef} className="h-screen w-full">
                <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
                    
                    {/* The initial white background */}
                    <div ref={whiteBgRef} className="absolute inset-0 bg-background z-40" />

                    {/* The Intro Text */}
                    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                        <h1 ref={evntosTextRef} className="text-primary text-6xl md:text-9xl font-bold font-headline">
                            evntos
                        </h1>
                    </div>
                    
                    {/* Splash Images Container */}
                    <div className="absolute inset-0 w-full h-full z-10">
                        {/* Static background image to prevent flashes and provide a base layer */}
                        <Image
                            src={splashImages[0].src}
                            alt={splashImages[0].alt}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                            className="z-0"
                            data-ai-hint={splashImages[0].aiHint}
                        />
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
