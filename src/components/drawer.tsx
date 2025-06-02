"use client";

import React, { useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { Region } from "./constants";
import { DropRegions } from "./drop-regions";
import { Sheet } from "./sheet";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { ChevronLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/lib/use-store";

// Custom modifier for rubberband effect
const rubberbandModifier = (args: any) => {
  return restrictToVerticalAxis(args);
};

const modifiers = [restrictToVerticalAxis, rubberbandModifier];

export function Drawer() {
  const selectedEvent = useStore((state) => state.selectedEvent);
  const setSelectedEvent = useStore((state) => state.setSelectedEvent);
  const expanded = useStore((state) => state.expanded);
  const setExpanded = useStore((state) => state.setExpanded);

  const tracked = useRef({
    distance: 0,
    timestamp: 0,
    velocity: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 25,
        tolerance: 40,
      },
    })
  );

  return (
    <DndContext
      autoScroll={false}
      modifiers={modifiers}
      sensors={sensors}
      onDragMove={({ delta }) => {
        // Track drag velocity
        const timestamp = Date.now();
        const timeDelta = timestamp - tracked.current.timestamp;
        const distance = tracked.current.distance - delta.y;
        const velocity = Math.round((distance / timeDelta) * 1000);

        tracked.current = {
          distance: delta.y,
          velocity,
          timestamp,
        };
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="fixed flex justify-center items-end inset-0 pointer-events-none overflow-hidden bg-black/5 max-w-md mx-auto">
        <Sheet
          expanded={expanded}
          header={selectedEvent ? <EventHeader /> : null}
        >
          <DrawerContent />
        </Sheet>
        <DropRegions />
      </div>
    </DndContext>
  );

  function handleDragEnd({ over }: DragEndEvent) {
    const { velocity } = tracked.current;

    if (Math.abs(velocity) > 500) {
      // Directional velocity is high, assume intent to expand/collapse
      // even if we are not over that region.
      if (velocity <= 0) {
        setSelectedEvent(null);
      }
      setExpanded(velocity > 0);
    } else if (over) {
      const expanded = over.id === Region.Expand;
      if (!expanded) {
        setSelectedEvent(null);
      }
      setExpanded(expanded);
    }

    tracked.current = {
      distance: 0,
      timestamp: 0,
      velocity: 0,
    };
  }
}

const DrawerContent = () => {
  const events = useStore((state) => state.events);
  const selectedEvent = useStore((state) => state.selectedEvent);
  const setSelectedEvent = useStore((state) => state.setSelectedEvent);

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

  return !selectedEvent ? (
    <div className="max-w-md mx-auto relative">
      <motion.div
        className="max-h-[85vh] flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="w-full text-2xl font-semibold h-10 bg-background shrink-0 grow-0 px-1.5 mb-8"
        >
          총 {events.length}개의 장소가 있어요.
        </motion.div>
        <motion.div
          className="flex flex-col gap-4 flex-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {events.map((event, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-2 rounded-xl cursor-pointer hover:bg-accent transition-colors flex gap-5"
              onClick={() => setSelectedEvent(event)}
              whileTap={{
                scale: 0.98,
                transition: { duration: 0.1 },
              }}
              layout
            >
              <div className="size-25 rounded-md overflow-hidden shrink-0">
                <Image
                  src={event.image_url}
                  alt={event.title}
                  width={100}
                  height={100}
                  className="w-full h-full rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-0.5 justify-center">
                <motion.h3
                  className="font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {event.title}
                </motion.h3>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  {event.date} • {event.district}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  ) : (
    <div className="max-w-md mx-auto">
      <motion.div
        className="max-h-[95vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div>
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
            <div className="text-base px-1 mb-3">
              {selectedEvent.description}
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-1"
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
      </motion.div>
    </div>
  );
};

const EventHeader = () => {
  const { selectedEvent, setSelectedEvent } = useStore();

  if (!selectedEvent) return null;

  return (
    <div className="relative flex items-center w-full px-4 py-3">
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="z-999"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setSelectedEvent(null);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          목록으로
        </Button>
      </motion.div>
      <h1 className="text-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {selectedEvent.title}
      </h1>
    </div>
  );
};
