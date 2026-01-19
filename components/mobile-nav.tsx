"use client";

import React from "react"

import { cn } from "@/lib/utils";
import { Calendar, Plane, Bookmark, Sparkles, Users, User, Receipt, Map } from "lucide-react";

type Panel = "itinerary" | "flights" | "bookings" | "saved" | "recommendations" | "travelers" | "profile" | "map";

interface MobileNavProps {
  activePanel: Panel;
  onPanelChange: (panel: Panel) => void;
}

const navItems: { id: Panel; label: string; icon: React.ElementType }[] = [
  { id: "itinerary", label: "Days", icon: Calendar },
  { id: "map", label: "Map", icon: Map },
  { id: "bookings", label: "Bookings", icon: Receipt },
  { id: "profile", label: "Profile", icon: User },
  { id: "travelers", label: "Squad", icon: Users },
  { id: "flights", label: "Travel", icon: Plane },
];

export function MobileNav({ activePanel, onPanelChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPanelChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[52px] px-2 py-1.5 rounded-xl transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground active:bg-muted"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "text-primary")} />
              <span className="text-[11px] font-medium leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
