"use client";

import { MapIcon, UserIcon, BellIcon, CogIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface TabItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

export function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const tabs: TabItem[] = [
    {
      icon: MapIcon,
      label: "지도",
      onClick: () => router.push("/"),
      isActive: pathname === "/",
    },
    {
      icon: MapIcon,
      label: "카드",
      onClick: () => router.push("/events/cards"),
      isActive: pathname === "/events/cards",
    },
  ];

  return (
    <motion.nav
      className="h-16 border-t bg-background/95 backdrop-blur-md fixed bottom-0 w-full max-w-md border-border/40 flex justify-center items-center gap-2 p-2"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.2,
      }}
    >
      {tabs.map((tab, index) => (
        <motion.button
          key={index}
          onClick={tab.onClick}
          className={cn(
            "flex flex-col items-center justify-center gap-1 relative h-12 grow",
            tab.isActive ? "text-primary" : "text-muted-foreground"
          )}
          whileTap={{
            scale: 0.95,
            transition: { duration: 0.1 },
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
        >
          {/* Active indicator background */}
          <AnimatePresence>
            {tab.isActive && (
              <motion.div
                className="absolute inset-0 bg-primary/10 rounded-lg mx-1"
                layoutId="activeTab"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
          </AnimatePresence>

          {/* Icon with animation */}
          <motion.div
            animate={{
              scale: tab.isActive ? 1.1 : 1,
              rotateZ: tab.isActive ? [0, -5, 5, 0] : 0,
            }}
            transition={{
              scale: { duration: 0.2 },
              rotateZ: { duration: 0.6, delay: tab.isActive ? 0.1 : 0 },
            }}
          >
            <tab.icon className="w-5 h-5 relative z-10" />
          </motion.div>

          {/* Ripple effect on tap */}
          <motion.div
            className="absolute inset-0 rounded-lg"
            initial={{ scale: 0, opacity: 0.5 }}
            whileTap={{
              scale: 1.5,
              opacity: 0,
              transition: { duration: 0.3 },
            }}
            style={{
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
            }}
          />
        </motion.button>
      ))}
    </motion.nav>
  );
}
