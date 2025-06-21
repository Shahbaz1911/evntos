
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarPlus, Users } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const heroImage = {
    src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmZXN0aXZhbCUyMGNyb3dkfGVufDB8fHx8MTc1MjI2MjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
    hint: "festival crowd",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export default function HeroSection() {
  return (
    <section id="hero" className="relative h-[90vh] bg-black text-white overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <Image
          src={heroImage.src}
          alt="A vibrant festival crowd"
          fill
          style={{ objectFit: 'cover' }}
          priority
          data-ai-hint={heroImage.hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 z-10" />
      </motion.div>

      <motion.div
        className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-6 md:space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-tight">
            <motion.span variants={itemVariants} className="inline-block">Host</motion.span>
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="inline-block mx-3 bg-gradient-to-r from-indigo-400 via-pink-500 to-orange-500 bg-clip-text text-transparent"
            >
              Unforgettable
            </motion.span>
            <motion.span variants={itemVariants} className="inline-block">Events, <span className="block md:inline-block">Effortlessly.</span></motion.span>
          </h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-white/90 max-w-xl mx-auto"
          >
            Evntos provides the tools you need to create, promote, and manage any event with ease. From meetups to conferences, make your next event a stunning success.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
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
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80 pt-4"
          >
            <div className="flex items-center">
              <CalendarPlus className="h-5 w-5 mr-2 text-white/70" />
              <span>Easy Event Creation</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-white/70" />
              <span>Seamless Management</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
