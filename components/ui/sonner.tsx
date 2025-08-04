"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { cn } from "@heroui/react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className=" group"
      position="top-right"  
      expand={false}
      visibleToasts={5}
      closeButton
      richColors
      duration={500000-0}
      gap={8}
      offset={16}
      
      toastOptions={{
        
    
        descriptionClassName: cn(
          'text-xs leading-relaxed',
          'text-light-foreground/80 dark:text-dark-foreground/80'
        ),
        actionButtonStyle: {
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          border: 'none',
          borderRadius: '8px',
          padding: '6px 10px',
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      
      }}
    
      {...props}
    />
  )
}

export { Toaster }