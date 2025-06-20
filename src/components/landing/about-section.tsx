
"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Users, Zap, Target } from 'lucide-react';

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

  return (
    <section id="about" className="bg-background text-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
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
          <div>
            <Card className="overflow-hidden shadow-xl rounded-lg border-border">
              <Image
                src="https://images.unsplash.com/photo-1503428593586-e225b39bddfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8ZXZlbnR8ZW58MHx8fHwxNzUwMzYxMzU4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Team working on Evntos platform"
                width={700}
                height={500}
                className="object-cover w-full h-full"
                data-ai-hint="diverse team collaboration"
              />
            </Card>
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
