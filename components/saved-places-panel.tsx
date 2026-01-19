"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SavedPlace, Destination } from "@/lib/trip-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bookmark,
  Plus,
  Trash2,
  UtensilsCrossed,
  Wine,
  Coffee,
  Star,
  ExternalLink,
} from "lucide-react";

interface SavedPlacesPanelProps {
  places: SavedPlace[];
  onRemove: (id: string) => void;
  onAddToDay: (place: SavedPlace) => void;
  currentDestination: Destination;
}

const categoryIcons = {
  restaurant: UtensilsCrossed,
  bar: Wine,
  cafe: Coffee,
  attraction: Star,
  tour: Star,
  other: Bookmark,
};

export function SavedPlacesPanel({
  places,
  onRemove,
  onAddToDay,
  currentDestination,
}: SavedPlacesPanelProps) {
  const [filter, setFilter] = useState<"all" | "copenhagen" | "reykjavik">("all");

  const filteredPlaces = places.filter((p) => {
    if (filter === "all") return true;
    return p.destination === filter;
  });

  const groupedPlaces = filteredPlaces.reduce(
    (acc, place) => {
      if (!acc[place.category]) {
        acc[place.category] = [];
      }
      acc[place.category].push(place);
      return acc;
    },
    {} as Record<string, SavedPlace[]>
  );

  const categories = Object.keys(groupedPlaces).sort();

  return (
    <Card className="lg:max-h-[calc(100vh-400px)] lg:overflow-y-auto">
      <CardHeader className="pb-3 sticky top-0 bg-card z-10">
        <CardTitle className="text-base flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-primary" />
          Saved Places
        </CardTitle>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mt-2">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="copenhagen" className="text-xs">
              CPH
            </TabsTrigger>
            <TabsTrigger value="reykjavik" className="text-xs">
              RVK
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No saved places yet
          </p>
        ) : (
          categories.map((category) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || Bookmark;
            return (
              <div key={category}>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  {category}s
                </h4>
                <div className="space-y-2">
                  {groupedPlaces[category].map((place) => (
                    <div
                      key={place.id}
                      className={cn(
                        "p-2.5 rounded-lg bg-muted/50 border border-border group",
                        "border-l-4",
                        place.destination === "copenhagen"
                          ? "border-l-copenhagen"
                          : "border-l-iceland"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">
                            {place.name}
                          </div>
                          {place.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {place.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {place.priceRange && (
                              <span className="text-xs text-muted-foreground">
                                {place.priceRange}
                              </span>
                            )}
                            {place.bookingUrl && (
                              <a
                                href={place.bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Link
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {place.destination === currentDestination && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onAddToDay(place)}
                              title="Add to current day"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => onRemove(place.id)}
                            title="Remove from saved"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
