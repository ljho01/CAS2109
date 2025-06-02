import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Header = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function Header({ children, className, ...props }, ref) {
  return (
    <div
      className={cn(
        "relative flex flex-shrink-0 box-border items-center justify-center",
        "bg-background rounded-t-2xl pt-6 min-h-10 font-semibold",
        "text-xl touch-none cursor-grab",
        "before:content-[''] before:absolute before:w-10 before:h-1",
        "before:top-2 before:rounded-md before:bg-muted",
        "before:transition-colors before:duration-200",
        "data-[dragging=true]:cursor-grabbing data-[dragging=true]:before:bg-black/12",
        className
      )}
      {...props}
      ref={ref}
    >
      {children}
    </div>
  );
});
