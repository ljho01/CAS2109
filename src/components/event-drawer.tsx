"use client";

import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  Drawer,
} from "@/components/ui/drawer";
import { ChevronLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface EventData {
  title: string;
  description: string;
  location: [number, number];
  date: string;
  district: string;
  image_url: string;
  ref_url: string[];
}

interface EventDrawerProps {
  events: EventData[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function EventDrawer({ onOpenChange, open, events }: EventDrawerProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  if (!events?.length) return null;

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setSelectedEvent(null);
        }
      }}
    >
      {!selectedEvent ? (
        <DrawerContent className="max-w-md mx-auto">
          <motion.div
            className="max-h-[85vh] overflow-y-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <DrawerHeader>
              <DrawerTitle className="text-xl">이벤트 목록</DrawerTitle>
              <motion.div variants={itemVariants}>
                <DrawerDescription>
                  총 {events.length}개의 이벤트가 있습니다.
                </DrawerDescription>
              </motion.div>
            </DrawerHeader>

            <div className="p-4">
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {events.map((event, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedEvent(event)}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                    layout
                  >
                    <motion.h3
                      className="font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {event.title}
                    </motion.h3>
                    <motion.p
                      className="text-sm text-gray-500 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    >
                      {event.date} • {event.district}
                    </motion.p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <DrawerFooter>
              <motion.div variants={itemVariants}>
                <DrawerClose asChild>
                  <Button className="w-full" variant="outline">
                    닫기
                  </Button>
                </DrawerClose>
              </motion.div>
            </DrawerFooter>
          </motion.div>
        </DrawerContent>
      ) : (
        <DrawerContent className="max-w-md mx-auto">
          <motion.div
            className="max-h-[95vh] overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <DrawerHeader>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => setSelectedEvent(null)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  목록으로
                </Button>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <DrawerTitle className="text-xl">
                  {selectedEvent.title}
                </DrawerTitle>
              </motion.div>

              {selectedEvent.image_url && (
                <motion.div
                  className="relative w-full h-48 my-4 rounded-lg overflow-hidden"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <Image
                    src={selectedEvent.image_url}
                    alt={selectedEvent.title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <DrawerDescription className="text-base">
                  {selectedEvent.description}
                </DrawerDescription>
              </motion.div>
            </DrawerHeader>

            <motion.div
              className="p-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-gray-500 mb-2">
                발생일: {selectedEvent.date}
              </p>
              <p className="text-sm text-gray-500">
                지역: {selectedEvent.district}
              </p>

              {selectedEvent.ref_url && selectedEvent.ref_url.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    참고자료
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.ref_url.map((url, index) => (
                      <motion.a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        참고 {index + 1}
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <DrawerFooter>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <DrawerClose asChild>
                  <Button className="w-full" variant="outline">
                    닫기
                  </Button>
                </DrawerClose>
              </motion.div>
            </DrawerFooter>
          </motion.div>
        </DrawerContent>
      )}
    </Drawer>
  );
}
