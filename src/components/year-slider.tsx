import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface YearSliderProps {
  className?: string;
  minYear: number;
  maxYear: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
}

export function YearSlider({ className, minYear, maxYear, value, onValueChange }: YearSliderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("flex flex-col items-end gap-2", className)}>
      {isOpen && (
        <div className="flex flex-col items-center gap-2 p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg mb-2">
          <span className="text-sm font-medium">{value[1]}</span>
          <div className="h-[200px] flex items-center">
            <Slider
              orientation="vertical"
              defaultValue={value}
              value={value}
              onValueChange={onValueChange as any}
              min={minYear}
              max={maxYear}
              step={1}
              className="h-full"
            />
          </div>
          <span className="text-sm font-medium">{value[0]}</span>
        </div>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-background/80 backdrop-blur-sm"
      >
        <Calendar className="h-4 w-4" />
        <ChevronUp className={cn(
          "h-3 w-3 transition-transform",
          isOpen ? "rotate-0" : "rotate-180"
        )} />
      </Button>
    </div>
  )
} 