"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { DayItinerary } from "@/lib/trip-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DayNavigationProps {
  days: DayItinerary[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function DayNavigation({ days, selectedIndex, onSelect }: DayNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = selectedRef.current;
      const containerWidth = container.offsetWidth;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;

      container.scrollTo({
        left: elementLeft - containerWidth / 2 + elementWidth / 2,
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative mb-6">
      {/* Scroll buttons for desktop */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-card/80 backdrop-blur-sm shadow-sm"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-card/80 backdrop-blur-sm shadow-sm"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Scrollable day pills */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-0 md:px-10 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {days.map((day, index) => {
          // Parse date as local date to avoid timezone issues
          const [year, month, dayOfMonth] = day.date.split('-').map(Number);
          const date = new Date(year, month - 1, dayOfMonth);
          const dayNum = date.getDate();
          const monthShort = date.toLocaleDateString("en-US", { month: "short" });
          const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
          const isSelected = index === selectedIndex;
          const isCopenhagen = day.destination === "copenhagen";

          return (
            <button
              key={day.date}
              ref={isSelected ? selectedRef : null}
              onClick={() => onSelect(index)}
              className={cn(
                "flex-shrink-0 px-4 py-4 rounded-2xl transition-all duration-200",
                "border-2 min-w-[80px] min-h-[72px] active:scale-95",
                isSelected
                  ? isCopenhagen
                    ? "bg-copenhagen text-primary-foreground border-copenhagen shadow-lg"
                    : "bg-iceland text-accent-foreground border-iceland shadow-lg"
                  : "bg-card border-border hover:border-muted-foreground/30 text-foreground"
              )}
            >
              <div className="text-center">
                <div className={cn("text-xs font-medium", isSelected ? "opacity-90" : "text-muted-foreground")}>
                  {day.dayNumber !== undefined ? `Day ${day.dayNumber}` : dayOfWeek.slice(0, 3)}
                </div>
                <div className="text-xl font-bold">{dayNum}</div>
                <div className={cn("text-xs", isSelected ? "opacity-90" : "text-muted-foreground")}>
                  {monthShort}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
