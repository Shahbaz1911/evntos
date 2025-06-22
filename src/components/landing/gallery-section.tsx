
"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

const images = [
  { src: 'https://media-alpha-green.vercel.app/evnto/gal.jpg', alt: 'A speaker at a large conference hall', aiHint: 'conference event' },
  { src: 'https://media-alpha-green.vercel.app/evnto/gal-2.jpg', alt: 'A musician playing guitar on a dimly lit stage', aiHint: 'music concert' },
  { src: 'https://media-alpha-green.vercel.app/evnto/gal-3.jpg', alt: 'An elegant outdoor wedding reception dinner setup', aiHint: 'wedding reception' },
  { src: 'https://media-alpha-green.vercel.app/evnto/event-4.jpg', alt: 'Professionals networking at a corporate event', aiHint: 'networking business' },
  { src: 'https://media-alpha-green.vercel.app/evnto/gal-5.jpg', alt: 'A lively party with people dancing under colorful lights', aiHint: 'dance party' },
  { src: 'https://media-alpha-green.vercel.app/evnto/gal-6.jpg', alt: 'People admiring artwork in a modern gallery exhibition', aiHint: 'art gallery' },
  { src: 'https://media-alpha-green.vercel.app/evnto/event-2.jpg', alt: 'A gourmet food festival with various food stalls', aiHint: 'food festival' },
  { src: 'https://media-alpha-green.vercel.app/evnto/gal-7.jpg', alt: 'An outdoor movie screening in a park at night', aiHint: 'outdoor screening' },
  { src: 'https://media-alpha-green.vercel.app/evnto/gal-4.jpg', alt: 'Volunteers participating in a charity run event', aiHint: 'charity run' },
];

interface GalleryColumnProps extends ComponentProps<'div'> {
  images: typeof images;
  animationConfig?: {
    duration?: string;
    direction?: 'normal' | 'reverse';
  };
}

const GalleryColumn = ({ images, className, animationConfig = {} }: GalleryColumnProps) => {
  return (
    <div className={cn("relative flex flex-col gap-4 overflow-hidden", className)}>
      <div
        className="flex flex-col gap-4 animate-marquee-y"
        style={{ 
          '--marquee-duration': animationConfig.duration || '30s',
          animationDirection: animationConfig.direction || 'normal',
         } as React.CSSProperties}
      >
        {/* Render images twice for the seamless loop */}
        {images.map((img, i) => (
           <div key={`col1-${i}`} className="relative overflow-hidden rounded-lg shadow-lg group border border-border">
            <Image
                src={img.src}
                alt={img.alt}
                width={500}
                height={700}
                className="w-full h-auto object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105"
                data-ai-hint={img.aiHint}
            />
             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
           </div>
        ))}
        {images.map((img, i) => (
            <div key={`col2-${i}`} className="relative overflow-hidden rounded-lg shadow-lg group border border-border">
                <Image
                    src={img.src}
                    alt={img.alt}
                    width={500}
                    height={700}
                    className="w-full h-auto object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105"
                    data-ai-hint={img.aiHint}
                />
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        ))}
      </div>
    </div>
  );
};


export default function GallerySection() {
  const numCols = 4;
  const cols: (typeof images)[] = Array.from({ length: numCols }, () => []);
  images.forEach((image, i) => cols[i % numCols].push(image));

  return (
    <section id="gallery" className="bg-secondary text-secondary-foreground overflow-hidden">
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

        <div className="relative h-[clamp(500px,80vh,800px)] grid grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
            <GalleryColumn images={cols[0]} animationConfig={{ duration: '40s' }} />
            <GalleryColumn images={cols[1]} animationConfig={{ duration: '60s', direction: 'reverse' }} />
            <GalleryColumn images={cols[2]} className="hidden md:flex" animationConfig={{ duration: '35s' }} />
            <GalleryColumn images={cols[3]} className="hidden md:flex" animationConfig={{ duration: '55s', direction: 'reverse' }}/>
        </div>
      </div>
    </section>
  );
}
