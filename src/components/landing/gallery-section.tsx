"use client";

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const images = [
  { src: 'https://media-alpha-green.vercel.app/evnto/event-conference.jpg', alt: 'A speaker at a large conference hall', aiHint: 'conference event', height: 500 },
  { src: 'https://media-alpha-green.vercel.app/evnto/event-music.jpg', alt: 'A musician playing guitar on a dimly lit stage', aiHint: 'music concert', height: 650 },
  { src: 'https://media-alpha-green.vercel.app/evnto/event-wedding.jpg', alt: 'An elegant outdoor wedding reception dinner setup', aiHint: 'wedding reception', height: 550 },
  { src: 'https://media-alpha-green.vercel.app/evnto/event-networking.jpg', alt: 'Professionals networking at a corporate event', aiHint: 'networking business', height: 450 },
  { src: 'https://media-alpha-green.vercel.app/evnto/event-party.jpg', alt: 'A lively party with people dancing under colorful lights', aiHint: 'dance party', height: 600 },
  { src: 'https://media-alpha-green.vercel.app/evnto/event-art.jpg', alt: 'People admiring artwork in a modern gallery exhibition', aiHint: 'art gallery', height: 520 },
  { src: 'https://media-alpha-green.vercel.app/evnto/event-food.jpg', alt: 'A gourmet food festival with various food stalls', aiHint: 'food festival', height: 680 },
  { src: 'https://media-alpha-green.vercel.app/evnto/event-outdoor.jpg', alt: 'An outdoor movie screening in a park at night', aiHint: 'outdoor screening', height: 500 },
  { src: 'https://media-alpha-green.vercel.app/evnto/event-charity.jpg', alt: 'Volunteers participating in a charity run event', aiHint: 'charity run', height: 480 },
];

export default function GallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const imageElements = gsap.utils.toArray('.gallery-image-wrapper');
      
      gsap.from(imageElements, {
        opacity: 0,
        y: 100,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%', 
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section id="gallery" ref={sectionRef} className="bg-secondary text-secondary-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Gallery
          </h2>
          <p className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            Moments We've Helped Create
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From intimate gatherings to large-scale conferences, see the diverse range of successful events powered by Evntos.
          </p>
        </div>

        <div
          ref={gridRef}
          className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
        >
          {images.map((image, index) => (
            <div key={index} className="gallery-image-wrapper break-inside-avoid">
              <div className="relative overflow-hidden rounded-lg shadow-lg group border border-border">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={500}
                  height={image.height}
                  className="w-full h-auto object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105"
                  data-ai-hint={image.aiHint}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
