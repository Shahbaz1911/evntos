
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";

import { Button } from "@/components/ui/button";

export function ThemeToggleButton() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const controls = useAnimationControls();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    // Trigger the glow animation
    controls.start({
      scale: [1, 1.5, 1],
      opacity: [0, 0.3, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  };

  // Avoid hydration mismatch by rendering a placeholder until the client has mounted.
  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled aria-label="Toggle theme" />;
  }

  const currentIconKey = resolvedTheme === "dark" ? "moon" : "sun";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Toggle theme"
      asChild // Use Button as a wrapper for our motion component
    >
      <motion.div
        className="relative flex items-center justify-center overflow-hidden"
        whileTap={{ scale: 0.9, rotate: 15 }} // Bounce and rotate effect
      >
        {/* Glow effect that is triggered manually */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)' }}
          animate={controls}
        />
        {/* AnimatePresence handles the smooth transition between the sun and moon icons */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIconKey}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute"
          >
            {currentIconKey === "moon" ? (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
          </motion.div>
        </AnimatePresence>
        <span className="sr-only">Toggle theme</span>
      </motion.div>
    </Button>
  );
}
