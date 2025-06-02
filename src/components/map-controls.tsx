"use client";

import { Minus, Plus, Crosshair, Sun, Moon } from "lucide-react";
import { Map as OLMap } from "ol";
import { fromLonLat } from "ol/proj";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

interface MapControlsProps {
  map: OLMap | null;
  className?: string;
}

export function MapControls({ map, className }: MapControlsProps) {
  const { theme, setTheme } = useTheme();

  const handleZoomIn = () => {
    if (!map) return;
    const view = map.getView();
    const zoom = view.getZoom() || 0;
    view.animate({
      zoom: zoom + 1,
      duration: 250,
    });
  };

  const handleZoomOut = () => {
    if (!map) return;
    const view = map.getView();
    const zoom = view.getZoom() || 0;
    view.animate({
      zoom: zoom - 1,
      duration: 250,
    });
  };

  const handleMyLocation = () => {
    if (!map || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = fromLonLat([longitude, latitude]);

        map.getView().animate({
          center: location,
          zoom: 15,
          duration: 500,
        });
      },
      (error) => {
        console.log("위치를 가져올 수 없습니다:", error);
      }
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.5,
      },
    },
  };

  const buttonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  return (
    <motion.div
      className={cn("flex flex-col gap-2", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex flex-col gap-2 p-2 bg-background/90 backdrop-blur-md rounded-lg shadow-lg border border-border/20"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div variants={buttonVariants}>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className="transition-all duration-200"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </Button>
        </motion.div>

        <motion.div variants={buttonVariants}>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className="transition-all duration-200"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Minus className="h-4 w-4" />
            </motion.button>
          </Button>
        </motion.div>

        <motion.div variants={buttonVariants}>
          <Button
            variant="outline"
            size="icon"
            onClick={handleMyLocation}
            className="transition-all duration-200"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95, rotate: 360 }}
              transition={{ duration: 0.2 }}
            >
              <Crosshair className="h-4 w-4" />
            </motion.button>
          </Button>
        </motion.div>

        <motion.div variants={buttonVariants}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="transition-all duration-200"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
