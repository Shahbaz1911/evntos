"use client";

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Users, Zap, Target } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';

const aboutImages = [
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxldmVudCUyMGNvbW11bml0eXxlbnwwfHx8fDE3NTIyNjI4MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "A group of people collaborating on laptops in a bright, modern space.",
    aiHint: "team collaboration"
  },
  {
    src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxldmVudCUyMGNvbW11bml0eXxlbnwwfHx8fDE3NTIyNjI4MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Diverse group of friends smiling and talking at an outdoor event.",
    aiHint: "diverse community"
  },
  {
    src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwcmVzZW50YXRpb24lMjBldmVudHxlbnwwfHx8fDE3NTIyNjI4ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "A speaker presenting to an engaged audience at a conference.",
    aiHint: "conference presentation"
  }
];

export default function AboutSection() {
  const features = [
    {
      icon: Users,
      title: "Community Focused",
      description: "Built for event organizers by event organizers, we understand your needs.",
      color: "text-primary",
    },
    {
      icon: Zap,
      title: "Streamlined Workflow",
      description: "From creation to post-event analysis, every step is simplified.",
      color: "text-accent",
    },
    {
      icon: Target,
      title: "Success Driven",
      description: "Our platform is designed to maximize your event's reach and impact.",
      color: "text-green-500",
    },
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const imageElements = gsap.utils.toArray<HTMLDivElement>('.about-image-item');

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${window.innerHeight * 2}`, // Scroll for twice the viewport height
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      }
    });
    
    // Animate from the first image to the second
    timeline.fromTo(imageElements[1], 
      { opacity: 0, scale: 1.05 },
      { opacity: 1, scale: 1, duration: 1, ease: "power2.inOut" },
      0 // Start at the beginning of the timeline
    );
    
    // Animate from the second image to the third
    timeline.fromTo(imageElements[2], 
      { opacity: 0, scale: 1.05 },
      { opacity: 1, scale: 1, duration: 1, ease: "power2.inOut" },
      1 // Start after the first animation
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div 
          className="text-center mb-16"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Who We Are
          </h2>
          <p className="text-3xl md:text-4xl font-bold font-headline">
            Powering Connections, One Event at a Time
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Evntos was born from a passion for bringing people together. We believe that well-organized events can create lasting memories, foster communities, and drive innovation. Our mission is to provide an intuitive, powerful, and affordable platform for anyone looking to host successful events.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div ref={imageContainerRef} className="relative w-full h-[500px]">
            {aboutImages.map((image, index) => (
              <div
                key={image.src}
                className="about-image-item absolute inset-0 w-full h-full"
                style={{ opacity: index === 0 ? 1 : 0 }}
              >
                <Card className="overflow-hidden shadow-xl rounded-lg border-border w-full h-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    style={{objectFit:"cover"}}
                    className="scale-105"
                    data-ai-hint={image.aiHint}
                  />
                </Card>
              </div>
            ))}
          </div>
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold font-headline text-primary">Our Core Values</h3>
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`p-2 bg-secondary rounded-full ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-foreground sm:text-lg">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
            <p className="text-muted-foreground">
              We are committed to continuous improvement, listening to our users, and building a platform that truly serves the event organizing community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
