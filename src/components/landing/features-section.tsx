"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarCog, Ticket, Users, Share2, BarChart3, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const textVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};


export default function FeaturesSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="features" className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.2 }}
        >
          <motion.h2 variants={textVariants} className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Features
          </motion.h2>
          <motion.p variants={textVariants} className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            Everything You Need for Event Success
          </motion.p>
          <motion.p variants={textVariants} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Evntos offers a comprehensive suite of features designed to simplify event management and amplify your impact.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          onMouseLeave={() => setHoveredId(null)}
        >
          {features.map((feature) => {
            const isHovered = hoveredId === feature.title;
            const isDimmed = hoveredId !== null && !isHovered;

            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="h-full flex"
                onMouseEnter={() => setHoveredId(feature.title)}
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className={`flex flex-col w-full shadow-lg hover:shadow-xl transition-all duration-300 border-border bg-card`}>
                  <CardHeader className="items-center text-center transition-all duration-300">
                    <motion.div
                      className="mb-4 inline-block"
                      animate={{ y: isDimmed ? -10 : 0 }}
                    >
                      <div className={`p-4 rounded-full ${feature.bgColor} inline-block`}>
                        <feature.icon className={`w-10 h-10 ${feature.iconColor}`} />
                      </div>
                    </motion.div>
                    <CardTitle className="font-headline text-lg text-card-foreground sm:text-xl">{feature.title}</CardTitle>
                  </CardHeader>

                  <AnimatePresence>
                    {!isDimmed && (
                       <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto', flexGrow: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden flex flex-col"
                        >
                          <CardContent className="flex-grow">
                            <CardDescription className="text-center text-card-foreground/80">{feature.description}</CardDescription>
                          </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  );
}
