"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FloatingCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
}

export function FloatingCard({ 
  children, 
  className, 
  delay = 0,
  direction = "up" 
}: FloatingCardProps) {
  const directionValues = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
  }

  return (
    <motion.div
      className={cn(
        "bg-background/90 backdrop-blur-md border border-border/20 rounded-lg shadow-lg",
        className
      )}
      initial={{ 
        opacity: 0, 
        scale: 0.9,
        ...directionValues[direction]
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: 0,
        y: 0
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.9,
        ...directionValues[direction]
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay 
      }}
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  )
}

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  )
}

interface PulsingCardProps {
  children: React.ReactNode
  className?: string
  intensity?: "low" | "medium" | "high"
}

export function PulsingCard({ 
  children, 
  className,
  intensity = "medium" 
}: PulsingCardProps) {
  const intensityValues = {
    low: { scale: [1, 1.01, 1] },
    medium: { scale: [1, 1.02, 1] },
    high: { scale: [1, 1.05, 1] }
  }

  return (
    <motion.div
      className={cn(
        "bg-background border border-border rounded-lg shadow-md",
        className
      )}
      animate={intensityValues[intensity]}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
} 