"use client";

import { Home, Bookmark } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function BottomTabs() {
  const pathname = usePathname();
  const t = useTranslations("tabs");

  const tabs = [
    {
      href: "/",
      icon: Home,
      label: t("home"),
      isActive: pathname === "/",
    },
    {
      href: "/myevents",
      icon: Bookmark,
      label: t("myEvents"),
      isActive: pathname === "/myevents",
    },
  ];

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/20 safe-area-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 1.2,
      }}
    >
      <div className="flex max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 px-4 relative transition-colors duration-200",
                tab.isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <motion.div
                className="relative"
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                <Icon className="h-5 w-5 mb-1" />
                {tab.isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-full -m-2"
                    layoutId="activeTab"
                    initial={false}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.div>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
