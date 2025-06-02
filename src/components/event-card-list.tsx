"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface EventData {
  title: string;
  description: string;
  location: [number, number];
  date: string;
  image_url?: string;
  ref_url?: string[];
}

interface EventCardListProps {
  events: EventData[];
}

export function EventCardList({ events }: EventCardListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      y: 50,
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6,
      },
    },
  };

  return (
    <motion.div
      className="p-4 grid gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {events.map((event, idx) => (
        <motion.div
          key={idx}
          variants={cardVariants}
          className="rounded-lg border shadow p-4 flex gap-4 items-center bg-background/80 backdrop-blur-sm"
          whileHover={{
            scale: 1.02,
            y: -4,
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
            transition: {
              duration: 0.2,
              type: "spring",
              stiffness: 400,
              damping: 25,
            },
          }}
          whileTap={{
            scale: 0.98,
            transition: { duration: 0.1 },
          }}
          layout
        >
          {event.image_url && (
            <motion.div
              className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 + 0.3 }}
          >
            <motion.h3
              className="font-semibold text-lg mb-1 text-gray-900"
              whileHover={{ color: "#3b82f6" }}
              transition={{ duration: 0.2 }}
            >
              {event.title}
            </motion.h3>
            <motion.p
              className="text-sm text-gray-600 line-clamp-2"
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {event.description}
            </motion.p>
            <motion.p
              className="text-xs text-gray-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 + 0.5 }}
            >
              {event.date}
            </motion.p>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
