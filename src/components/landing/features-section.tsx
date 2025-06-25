"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarCog, Ticket, Users, Share2, BarChart3, QrCode } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';

const features = [
  {
    icon: CalendarCog,
    title: "Intuitive Event Creation",
    description: "Easily set up your event details, schedule, and branding with our user-friendly interface.",
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Ticket,
    title: "Flexible Ticketing & Registration",
    description: "Manage free or paid registrations, customizable forms, and automated confirmations.",
    bgColor: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: Share2,
    title: "Powerful Promotion Tools",
    description: "Shareable event pages, social media integration, and SEO-friendly URLs to boost visibility.",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-600",
  },
  {
    icon: Users,
    title: "Guest List Management",
    description: "Track attendees, manage check-ins, and communicate effectively with your guests.",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
   {
    icon: QrCode,
    title: "QR Code Ticketing & Scanning",
    description: "Generate unique QR codes for each guest and use our scanner for smooth on-site check-ins.",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-600",
  },
  {
    icon: BarChart3,
    title: "Insightful Analytics",
    description: "Understand your event's performance with data on registrations, views, and engagement.",
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-600",
  },
];


const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => {
  return (
    <div className="animated-gradient-border h-full">
        <Card className="flex flex-col w-full h-full shadow-lg border-none bg-card p-6">
            <CardHeader className="items-center text-center p-0 mb-6">
                <div className={`p-4 rounded-full ${feature.bgColor} mb-4 inline-block`}>
                <feature.icon className={`w-12 h-12 ${feature.iconColor}`} />
                </div>
                <CardTitle className="font-headline text-xl text-card-foreground sm:text-2xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                <CardDescription className="text-center text-card-foreground/80 text-base">{feature.description}</CardDescription>
            </CardContent>
        </Card>
    </div>
  );
};


export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const cards = cardsContainerRef.current;
    if (!cards || !triggerRef.current) return;

    const pin = gsap.fromTo(
      cards,
      { translateX: 0 },
      {
        translateX: () => `-${cards.scrollWidth - window.innerWidth}px`,
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: () => `+=${cards.scrollWidth - window.innerWidth}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      }
    );
    
    return () => {
      pin.kill();
    };
  }, []);

  return (
    <section id="features" ref={sectionRef} className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 pt-16 md:pt-24">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Features
          </h2>
          <p className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            Everything You Need for Event Success
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Evntos offers a comprehensive suite of features designed to simplify event management and amplify your impact.
          </p>
        </div>
      </div>
      
      {/* Horizontal scroll section for all devices */}
      <div ref={triggerRef} className="h-screen overflow-hidden">
          <div ref={cardsContainerRef} className="w-max h-full flex items-center gap-8 px-8 sm:px-12 md:px-16">
              {features.map((feature) => (
                  <div key={feature.title} className="w-[80vw] sm:w-[60vw] md:w-[40vw] lg:w-[30vw] h-[60vh] flex-shrink-0">
                      <FeatureCard feature={feature} />
                  </div>
              ))}
          </div>
      </div>
    </section>
  );
}
