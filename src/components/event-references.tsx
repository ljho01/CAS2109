"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface EventReferencesProps {
  references: string[];
  className?: string;
  delay?: number;
}

export function EventReferences({
  references,
  className = "",
  delay = 0.3,
}: EventReferencesProps) {
  const t = useTranslations("drawer");

  if (!references || references.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <h4 className="text-sm font-medium text-muted-foreground">
        {t("references")}
      </h4>
      <div className="space-y-2">
        {references.map((url, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto p-2 text-left"
            asChild
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 justify-center"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate">{url}</span>
            </a>
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
