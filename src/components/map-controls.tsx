"use client"

import { Minus, Plus, Crosshair, Sun, Moon } from "lucide-react"
import { Map as OLMap } from "ol"
import { fromLonLat } from "ol/proj"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface MapControlsProps {
  map: OLMap | null
  className?: string
}

export function MapControls({ map, className }: MapControlsProps) {
  const { theme, setTheme } = useTheme()

  const handleZoomIn = () => {
    if (!map) return
    const view = map.getView()
    const zoom = view.getZoom() || 0
    view.animate({
      zoom: zoom + 1,
      duration: 250
    })
  }

  const handleZoomOut = () => {
    if (!map) return
    const view = map.getView()
    const zoom = view.getZoom() || 0
    view.animate({
      zoom: zoom - 1,
      duration: 250
    })
  }

  const handleMyLocation = () => {
    if (!map || !navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const location = fromLonLat([longitude, latitude])
        
        map.getView().animate({
          center: location,
          zoom: 15,
          duration: 500
        })
      },
      (error) => {
        console.error('위치를 가져올 수 없습니다:', error)
      }
    )
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleMyLocation}
        >
          <Crosshair className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
} 