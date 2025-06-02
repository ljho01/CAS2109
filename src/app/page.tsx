"use client";

import { MobileMap } from "@/components/mobile-map";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      className="min-h-screen flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.main
        className="w-full max-w-md flex flex-col bg-background shadow-xl relative overflow-hidden"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{
          delay: 0.1,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <MobileMap />
        </motion.div>
      </motion.main>
    </motion.div>
  );
}
