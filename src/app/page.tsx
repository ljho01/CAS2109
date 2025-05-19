import { MobileMap } from "@/components/mobile-map"
import { BottomTabs } from "@/components/bottom-tabs"

export default function Home() {
  return (
    <div className="min-h-screen flex justify-center">
      <main className="w-full max-w-md flex flex-col bg-background shadow-xl relative">
        <MobileMap />
        <BottomTabs />
      </main>
    </div>
  )
}
