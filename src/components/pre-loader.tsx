"use client";

import { motion } from 'framer-motion';

const PreLoader = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0.5, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1.2,
          ease: "easeInOut",
        }}
      >
        <h1 className="text-6xl font-bold font-headline text-primary">
          evntos
        </h1>
      </motion.div>
    </div>
  );
};

export default PreLoader;
