"use client";

import { Home, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="mt-auto z-50 flex h-14 w-full max-w-sm border-t bg-background">
      <a
        href="/newspeed"
        className={`flex-1 flex flex-col items-center justify-center text-xs font-medium transition-colors ${
          pathname === "/newspeed" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
      </a>
      <a
        href="/me"
        className={`flex-1 flex flex-col items-center justify-center text-xs font-medium transition-colors ${
          pathname === "/me" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
      </a>
    </nav>
  );
}
