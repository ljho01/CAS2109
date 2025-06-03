"use client";

import { useState, useEffect } from "react";

const SAVED_EVENTS_KEY = "saved-events";

export function useSavedEvents() {
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);

  // 로컬스토리지에서 저장된 이벤트 ID 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_EVENTS_KEY);
      if (saved) {
        setSavedEventIds(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load saved events:", error);
    }
  }, []);

  // 이벤트 저장
  const saveEvent = (eventId: string) => {
    const newSavedIds = [...savedEventIds, eventId];
    setSavedEventIds(newSavedIds);
    try {
      localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(newSavedIds));
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  // 이벤트 저장 해제
  const unsaveEvent = (eventId: string) => {
    const newSavedIds = savedEventIds.filter((id) => id !== eventId);
    setSavedEventIds(newSavedIds);
    try {
      localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(newSavedIds));
    } catch (error) {
      console.error("Failed to unsave event:", error);
    }
  };

  // 이벤트가 저장되어 있는지 확인
  const isEventSaved = (eventId: string) => {
    return savedEventIds.includes(eventId);
  };

  // 저장/해제 토글
  const toggleEventSaved = (eventId: string) => {
    if (isEventSaved(eventId)) {
      unsaveEvent(eventId);
    } else {
      saveEvent(eventId);
    }
  };

  return {
    savedEventIds,
    saveEvent,
    unsaveEvent,
    isEventSaved,
    toggleEventSaved,
  };
}
