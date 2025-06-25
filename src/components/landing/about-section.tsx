
"use client";

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const textElement = textRef.current;
    const triggerElement = triggerRef.current;
    if (!textElement || !triggerElement) return;

    // Calculate how much to scroll horizontally
    const amountToScroll = textElement.offsetWidth - window.innerWidth;

    // Only apply animation if text is wider than the viewport
    if (amountToScroll > 0) {
      const tween = gsap.timeline();

      // Horizontal scroll animation
      tween.to(textElement, {
        x: -amountToScroll,
        duration: 3,
        ease: "none",
      });
      
      // Color fill animation
      tween.to(textElement, {
        '--text-fill-progress': 1,
        duration: 3,
        ease: "none",
      }, 0); // Start at the same time as horizontal scroll

      ScrollTrigger.create({
        trigger: triggerElement,
        start: "center center",
        end: `+=${amountToScroll * 1.5}`, // Extend the scroll duration
        pin: true,
        scrub: 1,
        animation: tween,
        invalidateOnRefresh: true, // Recalculate on resize
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="bg-background text-foreground overflow-x-clip py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Our Mission
          </h2>
          <p className="text-3xl md:text-4xl font-bold font-headline">
            Powering Connections, One Event at a Time
          </p>
        </div>
      </div>
      
      {/* The trigger for the pinning and horizontal scroll */}
      <div ref={triggerRef} className="h-[200vh] relative bg-background">
          <div className="sticky top-1/2 -translate-y-1/2 flex items-center overflow-hidden">
              <div ref={textRef} className="flex items-center whitespace-nowrap pl-4 text-fill-scroll" style={{'--text-fill-progress': 0} as React.CSSProperties}>
                  <h3 className="text-6xl md:text-8xl font-bold font-headline pr-16">
                      We believe in the power of connection,
                  </h3>
                  <h3 className="text-6xl md:text-8xl font-bold font-headline pr-16">
                      the magic of shared experiences,
                  </h3>
                  <h3 className="text-6xl md:text-8xl font-bold font-headline">
                      and the simplicity of technology to bring people together.
                  </h3>
              </div>
          </div>
      </div>
    </section>
  );
}
