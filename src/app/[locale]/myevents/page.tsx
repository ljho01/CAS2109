"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useSavedEvents } from "@/hooks/use-saved-events";
import { EventData } from "@/types/events";
import { useStore } from "@/lib/use-store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Star, StarOff } from "lucide-react";
import Image from "next/image";
import { AudioPlayer } from "@/components/audio-player";
import { usePodcast } from "@/hooks/use-podcast";
import { BottomTabs } from "@/components/bottom-tabs";
import { EventReferences } from "@/components/event-references";

export default function MyEventsPage() {
  const t = useTranslations("myEvents");
  const locale = useLocale();
  const { savedEventIds, isEventSaved, toggleEventSaved } = useSavedEvents();
  const { selectedEvent, setSelectedEvent } = useStore();

  const [savedEvents, setSavedEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 저장된 이벤트들을 서버에서 가져오기
  useEffect(() => {
    const fetchSavedEvents = async () => {
      if (savedEventIds.length === 0) {
        setSavedEvents([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/events/saved", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventIds: savedEventIds,
            locale,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch saved events");
        }

        const data = await response.json();
        setSavedEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching saved events:", error);
        setError(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    fetchSavedEvents();
  }, [savedEventIds, locale, t]);

  if (selectedEvent) {
    return <EventDetail selectedEvent={selectedEvent} />;
  }

  return (
    <div className="h-screen bg-background">
      <div className="max-w-md mx-auto h-full relative">
        {/* Header */}
        <motion.div
          className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/20 p-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { count: savedEvents.length })}
          </p>
        </motion.div>

        {/* Content */}
        <div className="p-4">
          {loading && (
            <motion.div
              className="flex items-center justify-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">{t("loading")}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="text-center py-8 text-red-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          {!loading && !error && savedEvents.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("empty.title")}</h3>
              <p className="text-muted-foreground">{t("empty.description")}</p>
            </motion.div>
          )}

          {!loading && !error && savedEvents.length > 0 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence>
                {savedEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    isEventSaved={isEventSaved}
                    toggleEventSaved={toggleEventSaved}
                    onSelect={() => setSelectedEvent(event)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <BottomTabs />
      </div>
    </div>
  );
}

interface EventCardProps {
  event: EventData;
  index: number;
  isEventSaved: (id: string) => boolean;
  toggleEventSaved: (id: string) => void;
  onSelect: () => void;
}

function EventCard({
  event,
  index,
  isEventSaved,
  toggleEventSaved,
  onSelect,
}: EventCardProps) {
  const t = useTranslations("drawer");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="bg-background border border-border/20 rounded-lg shadow-sm overflow-hidden cursor-pointer"
      onClick={onSelect}
    >
      <div className="aspect-[16/10] relative">
        <Image
          src={event.image_url}
          alt={event.title}
          fill
          className="object-cover"
        />
        <motion.button
          className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            toggleEventSaved(event.id);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isEventSaved(event.id) ? (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          ) : (
            <StarOff className="h-4 w-4 text-muted-foreground" />
          )}
        </motion.button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {event.description}
        </p>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {t("date")}: {event.date}
          </span>
          <span>
            {t("district")}: {event.district}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function EventDetail({ selectedEvent }: { selectedEvent: EventData }) {
  const t = useTranslations("drawer");
  const setSelectedEvent = useStore((state) => state.setSelectedEvent);
  const { isEventSaved, toggleEventSaved } = useSavedEvents();

  const locale = useLocale();
  const { isAvailable: podcastAvailable } = usePodcast(
    selectedEvent.id,
    locale
  );

  return (
    <div className="h-screen bg-background">
      <div className="max-w-md mx-auto relative h-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/20 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEvent(null)}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("events")}
            </Button>

            <motion.button
              className="p-2"
              onClick={() => toggleEventSaved(selectedEvent.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isEventSaved(selectedEvent.id) ? (
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="h-5 w-5 text-muted-foreground" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          className="p-4 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Event Image */}
          <div className="aspect-[16/10] rounded-lg overflow-hidden">
            <Image
              src={selectedEvent.image_url}
              alt={selectedEvent.title}
              width={400}
              height={250}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold">{selectedEvent.title}</h1>

          {/* Podcast Player */}
          {podcastAvailable && (
            <AudioPlayer
              eventId={selectedEvent.id}
              locale={locale}
              className="w-full"
            />
          )}

          {/* Description */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {selectedEvent.description}
            </p>
          </div>

          {/* Date and District */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              {t("date")}: {selectedEvent.date}
            </span>
            <span>
              {t("district")}: {selectedEvent.district}
            </span>
          </div>

          {/* References */}
          <EventReferences references={selectedEvent.ref_url} />
        </motion.div>

        <BottomTabs />
      </div>
    </div>
  );
}
