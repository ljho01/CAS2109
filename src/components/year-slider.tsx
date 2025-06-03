"use client";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface YearSliderProps {
  className?: string;
  minYear: number;
  maxYear: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
}

export function YearSlider({
  className,
  minYear,
  maxYear,
  value,
  onValueChange,
}: YearSliderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className={cn("flex flex-col items-end gap-2", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.7,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col items-center gap-2 p-4 bg-background/90 backdrop-blur-md rounded-lg shadow-lg mb-2 border border-border/20"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <motion.span
              className="text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {value[1]}
            </motion.span>
            <motion.div
              className="h-[200px] flex items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Slider
                orientation="vertical"
                defaultValue={value}
                value={value}
                onValueChange={onValueChange as any}
                min={minYear}
                max={maxYear}
                step={1}
                className="h-full"
              />
            </motion.div>
            <motion.span
              className="text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {value[0]}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-full"
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
          >
            <Calendar className="h-4 w-4" />
          </motion.div>
        </Button>
      </motion.div>
    </motion.div>
  );
}
