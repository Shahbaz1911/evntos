
"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Import Carousel components

const testimonials = [
  {
    name: "Sarah L.",
    role: "Conference Organizer",
    avatar: "https://placehold.co/100x100.png",
    rating: 5,
    quote: "Eventos transformed how we manage our annual tech conference. The QR code check-in was a lifesaver, and the platform is incredibly intuitive!",
    companyLogo: "https://placehold.co/120x40.png?text=TechConf&bg=cccccc&fc=333333",
    aiHint: "professional woman",
  },
  {
    name: "Mike P.",
    role: "Meetup Host",
    avatar: "https://placehold.co/100x100.png",
    rating: 5,
    quote: "As a host for local developer meetups, Eventos made it super easy to create event pages and track RSVPs. Highly recommend for community builders!",
    companyLogo: "https://placehold.co/120x40.png?text=DevMeet&bg=cccccc&fc=333333",
    aiHint: "friendly man",
  },
  {
    name: "Jessica B.",
    role: "Workshop Facilitator",
    avatar: "https://placehold.co/100x100.png",
    rating: 4,
    quote: "The PDF ticket generation is fantastic for my workshops. My attendees love the professional look and feel. The platform is robust and reliable.",
    companyLogo: "https://placehold.co/120x40.png?text=CreativeFlow&bg=cccccc&fc=333333",
    aiHint: "creative person",
  },
  {
    name: "David K.",
    role: "Non-profit Fundraiser",
    avatar: "https://placehold.co/100x100.png",
    rating: 5,
    quote: "Managing registrations and communicating with attendees for our fundraising gala was seamless with Eventos. The analytics helped us understand our reach better.",
    companyLogo: "https://placehold.co/120x40.png?text=HopeOrg&bg=cccccc&fc=333333",
    aiHint: "charitable man",
  },
  {
    name: "Emily R.",
    role: "Community Manager",
    avatar: "https://placehold.co/100x100.png",
    rating: 4,
    quote: "Eventos has a clean interface and all the essential features for our online webinars and local chapter meetups. The AI slug generator is a nice touch!",
    companyLogo: "https://placehold.co/120x40.png?text=ConnectHub&bg=cccccc&fc=333333",
    aiHint: "professional woman tech"
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-background text-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Testimonials
          </h2>
          <p className="text-3xl md:text-4xl font-bold font-headline">
            Loved by Organizers Worldwide
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear what our users have to say about their experience with Eventos.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col border-border bg-card h-full">
                    <CardContent className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`}
                          />
                        ))}
                      </div>
                      <blockquote className="text-card-foreground/90 italic mb-6 flex-grow">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center mt-auto">
                        <Avatar className="h-12 w-12 mr-4 border-2 border-primary/50">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.aiHint} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground">{testimonial.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                         {testimonial.companyLogo && (
                           <div className="ml-auto pl-2">
                             <Image src={testimonial.companyLogo} alt={`${testimonial.role} Company Logo`} width={80} height={26} className="object-contain opacity-70" data-ai-hint="company logo" />
                           </div>
                         )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
