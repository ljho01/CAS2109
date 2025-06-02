"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

interface DraggableBottomSheetProps {
  children: React.ReactNode;
  className?: string;
  snapPoints?: number[]; // 0 = closed, 0.5 = half, 1 = full
  initialSnap?: number;
  onSnapChange?: (snap: number) => void;
}

export function DraggableBottomSheet({
  children,
  className,
  snapPoints = [0.1, 0.5, 0.9], // 10%, 50%, 90% of screen height
  initialSnap = 0,
  onSnapChange,
}: DraggableBottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const getSnapPosition = (snapIndex: number) => {
    if (typeof window === "undefined") return 0;
    const windowHeight = window.innerHeight;
    const sheetHeight = windowHeight * snapPoints[snapIndex];
    return windowHeight - sheetHeight;
  };

  const findClosestSnap = (y: number) => {
    if (typeof window === "undefined") return currentSnap;

    const windowHeight = window.innerHeight;
    const sheetHeight = windowHeight - y;
    const currentPosition = sheetHeight / windowHeight;

    let closestIndex = 0;
    let minDistance = Math.abs(snapPoints[0] - currentPosition);

    for (let i = 1; i < snapPoints.length; i++) {
      const distance = Math.abs(snapPoints[i] - currentPosition);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);

    if (!sheetRef.current) return;

    const rect = sheetRef.current.getBoundingClientRect();
    const relativeY = rect.top;

    const newSnapIndex = findClosestSnap(relativeY);
    setCurrentSnap(newSnapIndex);
    onSnapChange?.(newSnapIndex);
  };

  useEffect(() => {
    setCurrentSnap(initialSnap);
  }, [initialSnap]);

  const currentHeight =
    typeof window !== "undefined"
      ? window.innerHeight * snapPoints[currentSnap]
      : snapPoints[currentSnap] * 100;

  return (
    <motion.div
      ref={sheetRef}
      className={cn(
        "fixed left-0 right-0 bottom-0 bg-background border-t border-border rounded-t-xl shadow-2xl",
        "flex flex-col max-w-md mx-auto overflow-hidden",
        className
      )}
      drag="y"
      dragConstraints={{
        top:
          typeof window !== "undefined"
            ? window.innerHeight * (1 - snapPoints[snapPoints.length - 1])
            : 0,
        bottom:
          typeof window !== "undefined"
            ? window.innerHeight * (1 - snapPoints[0])
            : 0,
      }}
      dragElastic={0.1}
      dragMomentum={false}
      animate={{
        y: getSnapPosition(currentSnap),
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{
        height: currentHeight,
        zIndex: className?.includes("z-50") ? 50 : 40,
      }}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-center py-2 bg-background border-b border-border/50 cursor-grab active:cursor-grabbing">
        <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </motion.div>
  );
}
