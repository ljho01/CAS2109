import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { MAX_DRAWER_HEIGHT_PERCENT } from "./constants";

interface Props {
  children: React.ReactNode;
  expanded?: boolean;
  header: React.ReactNode;
}

export function Sheet({ children, expanded, header }: Props) {
  const { attributes, isDragging, listeners, transform, setNodeRef } =
    useDraggable({
      id: "header",
    });

  return (
    <div
      className={cn(
        "relative pointer-events-auto flex flex-col w-full transition-transform duration-200 ease-in-out",
        "transform translate-x-0 after:content-[''] after:block after:absolute after:bottom-0 after:w-full after:h-full after:translate-y-full after:bg-accent",
        {
          "transition-none": isDragging,
          "transform translate-x-0": expanded,
        }
      )}
      style={
        {
          "--max-height": `${MAX_DRAWER_HEIGHT_PERCENT * 100}vh`,
          "--transform": transform ? `${transform.y}px` : undefined,
          maxHeight: "var(--max-height)",
          transform: expanded
            ? `translate3d(0, var(--transform, 0px), 0)`
            : `translate3d(0, calc(100% - 120px + var(--transform, 0px)), 0)`,
        } as React.CSSProperties
      }
    >
      <Header
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        data-dragging={isDragging}
      >
        {header}
      </Header>
      <div className="block overflow-y-auto px-5 pb-5 pt-3 bg-background">
        {children}
      </div>
    </div>
  );
}
