"use client"

import { MapIcon, UserIcon, BellIcon, CogIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  isActive: boolean
}

export function BottomTabs() {
  const tabs: TabItem[] = [
    {
      icon: MapIcon,
      label: "지도",
      onClick: () => {},
      isActive: true,
    },
    {
      icon: BellIcon,
      label: "알림",
      onClick: () => {},
      isActive: false,
    },
    {
      icon: UserIcon,
      label: "프로필",
      onClick: () => {},
      isActive: false,
    },
    {
      icon: CogIcon,
      label: "설정",
      onClick: () => {},
      isActive: false,
    },
  ]

  return (
    <nav className="h-16 border-t bg-background grid grid-cols-4 fixed bottom-0 w-full max-w-md">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={tab.onClick}
          className={cn(
            "flex flex-col items-center justify-center gap-1",
            tab.isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <tab.icon className="w-5 h-5" />
          <span className="text-xs">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
} 