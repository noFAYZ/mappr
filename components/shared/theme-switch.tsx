'use client'

import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Sun, Moon, Stars } from "lucide-react"
import { Button } from "@heroui/button"
import { cn } from "@heroui/react"


export default function ThemeSwitcher( ) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
    isIconOnly
      variant="ghost"
      size="sm"
     
      onClick={toggleTheme}
      className={cn(
        " shadow-md  rounded-full",
        " border border-divider",
        "group"
      )}
    >


        {/* Sun */}
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 0 : 1,
            y: theme === 'dark' ? 20 : 0,
            opacity: theme === 'dark' ? 0 : 1
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
            
          <Sun className={cn(
            "w-4 h-4",
            "text-orange-500",
            "transition-transform duration-200",
            "group-hover:rotate-90"
          )} />
          <motion.div 
            className="absolute inset-0 rounded-3xl bg-orange-500"
            initial={false}
            animate={{
              opacity: [0.1, 0.15, 0.1],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
        </motion.div>

        {/* Moon & Stars */}
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 1 : 0,
            y: theme === 'dark' ? 0 : -20,
            opacity: theme === 'dark' ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className={cn(
            "w-4 h-4",
            "text-white/60",
            "transition-transform duration-200",
            "group-hover:rotate-90"
          )} />

    
        </motion.div>

        {/* Border Gradient Animation */}
     
     
    </Button>
  )
}