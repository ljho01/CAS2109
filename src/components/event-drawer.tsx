import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { ChevronLeft } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "./ui/button"

interface EventData {
  title: string;
  description: string;
  location: [number, number];
  date: string;
  image_url?: string;
}

interface EventDrawerProps {
  events: EventData[];
}

export function EventDrawer({ events }: EventDrawerProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  if (!events?.length) return null;

  if (selectedEvent) {
    return (
      <DrawerContent className="max-w-md mx-auto">
        <div className="max-h-[85vh] overflow-y-auto">
          <DrawerHeader>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => setSelectedEvent(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              목록으로
            </Button>
            <DrawerTitle className="text-xl">{selectedEvent.title}</DrawerTitle>
            {selectedEvent.image_url && (
              <div className="relative w-full h-48 my-4 rounded-lg overflow-hidden">
                <Image
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <DrawerDescription className="text-base">
              {selectedEvent.description}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-gray-500">발생일: {selectedEvent.date}</p>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button className="w-full" variant="outline">
                닫기
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    );
  }

  return (
    <DrawerContent className="max-w-md mx-auto">
      <div className="max-h-[85vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="text-xl">이벤트 목록</DrawerTitle>
          <DrawerDescription>
            총 {events.length}개의 이벤트가 있습니다.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border cursor-pointer hover:bg-accent"
                onClick={() => setSelectedEvent(event)}
              >
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{event.date}</p>
              </div>
            ))}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className="w-full" variant="outline">
              닫기
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </div>
    </DrawerContent>
  );
} 