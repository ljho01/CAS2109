"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  const dotVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            "bg-primary rounded-full",
            sizeClasses[size]
          )}
          variants={dotVariants}
          animate="animate"
          style={{
            animationDelay: `${index * 0.2}s`
          }}
          transition={{
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  )
}

export function LoadingOverlay({ children }: { children?: React.ReactNode }) {
  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingSpinner size="lg" className="mb-4" />
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}

export function PulseLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("w-4 h-4 bg-primary rounded-full", className)}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
} 