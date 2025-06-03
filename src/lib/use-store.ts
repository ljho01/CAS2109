import { create } from "zustand";
import { EventData } from "@/types/events";

interface Store {
  events: EventData[];
  setEvents: (events: EventData[]) => void;
  selectedEvent: EventData | null;
  setSelectedEvent: (event: EventData | null) => void;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  selectedEvent: null,
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  expanded: false,
  setExpanded: (expanded) => set({ expanded }),
}));

export type { EventData };
