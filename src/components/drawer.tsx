"use client";

import React, { useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import { ChevronLeft, Star, StarOff } from "lucide-react";
import Image from "next/image";
import { EventData, useStore } from "@/lib/use-store";
import { AudioPlayer } from "./audio-player";
import { usePodcast } from "@/hooks/use-podcast";
import { useSavedEvents } from "@/hooks/use-saved-events";
import { EventReferences } from "./event-references";

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
  const t = useTranslations("drawer");
  const events = useStore((state) => state.events);
  const selectedEvent = useStore((state) => state.selectedEvent);
  const setSelectedEvent = useStore((state) => state.setSelectedEvent);
  const { isEventSaved, toggleEventSaved } = useSavedEvents();

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

  if (selectedEvent) {
    return <EventDetail selectedEvent={selectedEvent} />;
  }

  return (
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
          <div className="flex flex-col">
            <span className="text-2xl">{t("title")}</span>
            <span className="text-sm text-muted-foreground font-normal">
              {t("subtitle", { count: events.length })}
            </span>
          </div>
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
              className="p-2 rounded-xl cursor-pointer hover:bg-accent transition-colors flex gap-5 relative"
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
              <div className="flex flex-col gap-0.5 justify-center flex-1">
                <motion.h3
                  className="font-semibold w-[90%] truncate"
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
              <motion.button
                className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEventSaved(event.id);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {isEventSaved(event.id) ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground" />
                )}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

const EventHeader = () => {
  const { selectedEvent, setSelectedEvent } = useStore();
  const { isEventSaved, toggleEventSaved } = useSavedEvents();

  if (!selectedEvent) return null;

  return (
    <div className="relative flex items-center w-full px-4 py-3">
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mr-auto"
      >
        <Button
          variant="ghost"
          size="icon"
          onPointerDown={() => setSelectedEvent(null)}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-lg line-clamp-1 break-all">
          {selectedEvent.title}
        </span>
      </motion.div>

      <motion.button
        className="p-2 ml-2 rounded-full hover:bg-muted transition-colors"
        onClick={() => toggleEventSaved(selectedEvent.id)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isEventSaved(selectedEvent.id) ? (
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
        ) : (
          <StarOff className="h-5 w-5 text-muted-foreground" />
        )}
      </motion.button>
    </div>
  );
};

const EventDetail = ({ selectedEvent }: { selectedEvent: EventData }) => {
  const t = useTranslations("drawer");
  const locale = useLocale();
  const { isAvailable: podcastAvailable } = usePodcast(
    selectedEvent.id,
    locale
  );

  if (!selectedEvent) {
    console.warn("EventDetail rendered without a selectedEvent");
    return <div className="p-4 text-center">{t("eventNotSelected")}</div>;
  }

  return (
    <motion.div
      className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto p-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* 이벤트 이미지 */}
      <div className="w-full aspect-[16/10] rounded-lg overflow-hidden">
        <Image
          src={selectedEvent.image_url}
          alt={selectedEvent.title}
          width={400}
          height={250}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 팟캐스트 플레이어 (팟캐스트가 있는 경우에만 표시) */}
      {podcastAvailable && (
        <AudioPlayer
          eventId={selectedEvent.id}
          locale={locale}
          className="w-full"
        />
      )}

      {/* 이벤트 설명 */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          {selectedEvent.description}
        </p>
      </motion.div>

      {/* 날짜와 구역 정보 */}
      <motion.div
        className="flex gap-4 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <span>
          {t("date")}: {selectedEvent.date}
        </span>
        <span>
          {t("district")}: {selectedEvent.district}
        </span>
      </motion.div>

      {/* 참고 링크들 */}
      <EventReferences references={selectedEvent.ref_url} />
    </motion.div>
  );
};
