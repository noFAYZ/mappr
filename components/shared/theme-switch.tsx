"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { Button } from "@heroui/button";
import { cn } from "@heroui/react";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Show a neutral state during SSR/initial load
  if (!mounted) {
    return (
      <Button
        disabled
        isIconOnly
        className={cn(
          "shadow-md rounded-full",
          "border border-divider",
          "group relative",
        )}
        size="sm"
        variant="ghost"
      >
        <Sun className="w-4 h-4 text-default-500" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      isIconOnly
      className={cn(
        " shadow-md  rounded-full",
        " border border-divider",
        "group",
      )}
      size="sm"
      variant="ghost"
      onClick={toggleTheme}
    >
      {/* Sun */}
      <motion.div
        animate={{
          scale: theme === "dark" ? 0 : 1,
          y: theme === "dark" ? 20 : 0,
          opacity: theme === "dark" ? 0 : 1,
        }}
        className="absolute inset-0 flex items-center justify-center z-20"
        initial={false}
        transition={{ duration: 0.2 }}
      >
        <Sun
          className={cn(
            "w-4 h-4",
            "text-orange-500",
            "transition-transform duration-200",
            "group-hover:rotate-90",
          )}
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.15, 0.1],
            scale: [1, 1.1, 1],
          }}
          className="absolute inset-0 rounded-3xl bg-orange-500"
          initial={false}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
      </motion.div>

      {/* Moon & Stars */}
      <motion.div
        animate={{
          scale: theme === "dark" ? 1 : 0,
          y: theme === "dark" ? 0 : -20,
          opacity: theme === "dark" ? 1 : 0,
        }}
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        transition={{ duration: 0.3 }}
      >
        <Moon
          className={cn(
            "w-4 h-4",
            "text-white/60",
            "transition-transform duration-200",
            "group-hover:rotate-90",
          )}
        />
      </motion.div>

      {/* Border Gradient Animation */}
    </Button>
  );
}
