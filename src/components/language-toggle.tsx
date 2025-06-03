"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isPending, setIsPending] = useState(false);

  const switchLocale = (newLocale: string) => {
    setIsPending(true);

    // Use next-intl's router for proper locale switching
    router.replace(pathname, { locale: newLocale });

    setTimeout(() => setIsPending(false), 500);
  };

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.8,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-full"
              disabled={isPending}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                <Globe className="h-4 w-4" />
              </motion.div>
              <span className="sr-only">언어 변경</span>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-32">
          <DropdownMenuItem
            onClick={() => switchLocale("ko")}
            className={locale === "ko" ? "bg-accent" : ""}
            disabled={isPending}
          >
            {t("korean")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => switchLocale("en")}
            className={locale === "en" ? "bg-accent" : ""}
            disabled={isPending}
          >
            {t("english")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
