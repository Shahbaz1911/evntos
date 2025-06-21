"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const faqItems = [
  {
    id: "faq-1",
    question: "Is Evntos free to use?",
    answer:
      "Evntos offers a generous free tier for basic event management, allowing you to create and manage events with core features. For advanced functionalities like larger guest lists or premium support, we have affordable subscription plans.",
  },
  {
    id: "faq-2",
    question: "Can I customize my event page?",
    answer:
      "Absolutely! You can add detailed descriptions, upload captivating images or banners, specify venue names, addresses, and even embed Google Maps links to make your event page informative and unique.",
  },
  {
    id: "faq-3",
    question: "How does the QR code ticketing and scanning work?",
    answer:
      "When a guest registers, Evntos generates a unique QR code for their PDF ticket. At your event, you can use our built-in scanner (accessible via the event dashboard) on any smartphone or tablet to quickly and securely check attendees in.",
  },
  {
    id: "faq-4",
    question: "Is there a limit to the number of events I can create?",
    answer:
      "Our free tier may have certain limitations on the number of active events or attendees. However, our premium plans are designed to scale with your needs, offering options for unlimited event creation and larger capacities.",
  },
  {
    id: "faq-5",
    question: "What kind of support do you offer?",
    answer:
      "We offer comprehensive documentation and FAQs on our website. Users on premium plans also have access to priority email support to help with any questions or issues you might encounter.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
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

export default function FaqSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section id="faq" ref={ref} className="bg-secondary text-secondary-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.2 }}
        >
          <motion.h2 variants={textVariants} className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Need Answers?
          </motion.h2>
          <motion.p variants={textVariants} className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            Frequently Asked Questions
          </motion.p>
          <motion.p variants={textVariants} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Find quick answers to common questions about Evntos. If you don't
            see your question here, feel free to reach out to our support team.
          </motion.p>
        </motion.div>

        <motion.div style={{ y }}>
          <div className="max-w-3xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item) => (
                  <motion.div key={item.id} variants={itemVariants}>
                      <AccordionItem
                        value={item.id}
                        className="border-border bg-card shadow-sm rounded-lg mb-3"
                      >
                        <AccordionTrigger className="px-6 py-4 text-base sm:text-lg font-medium text-left text-card-foreground hover:no-underline hover:text-primary">
                          <div className="flex items-center">
                            <HelpCircle className="w-5 h-5 mr-3 text-primary/80" />
                            {item.question}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4 pt-0 text-card-foreground/80 text-sm sm:text-base">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
