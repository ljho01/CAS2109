"use client"

import { EventCardList } from "@/components/event-card-list";
import eventsDataRaw from "@/events.json";
import { motion } from "framer-motion";

const eventsData = (eventsDataRaw as any[]).map(e => ({
  ...e,
  location: [e.location[0], e.location[1]] as [number, number],
}));

export default function EventCardsPage() {
  return (
    <motion.main 
      className="pt-4 pb-20 max-w-md mx-auto min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <motion.h1 
        className="text-2xl font-bold px-4 mb-4 text-gray-900"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        카드 이벤트 목록
      </motion.h1>
      <EventCardList events={eventsData} />
    </motion.main>
  );
} 