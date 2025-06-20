
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarCog, Ticket, Users, Share2, BarChart3, QrCode } from 'lucide-react';

const services = [
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

export default function ServicesSection() {
  return (
    <section id="services" className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Our Services
          </h2>
          <p className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            Everything You Need for Event Success
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Eventos offers a comprehensive suite of features designed to simplify event management and amplify your impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border bg-card">
              <CardHeader className="items-center text-center">
                <div className={`p-4 rounded-full ${service.bgColor} mb-4 inline-block`}>
                  <service.icon className={`w-10 h-10 ${service.iconColor}`} />
                </div>
                <CardTitle className="font-headline text-lg text-card-foreground sm:text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-card-foreground/80">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
