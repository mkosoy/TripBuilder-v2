"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, AlertCircle } from "lucide-react";
import { DayNavigation } from "@/components/day-navigation";
import type { DayItinerary, Traveler } from "@/lib/trip-data";

interface MapPanelProps {
  days: DayItinerary[];
  currentUserId: string;
  travelers: Traveler[];
}

export function MapPanel({ days, currentUserId, travelers }: MapPanelProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDay = days[selectedDayIndex];
  const currentUser = travelers.find(t => t.id === currentUserId);
  const isMarkUser = currentUser?.name === "Mark"; // Simple permission check

  // Load map when day changes
  useEffect(() => {
    if (currentDay?.id) {
      loadMapForDay(currentDay.id);
    }
  }, [selectedDayIndex, currentDay?.id]);

  async function loadMapForDay(dayId: string | undefined) {
    if (!dayId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load map");
      }

      setMapData(data.map);
    } catch (err: any) {
      console.error("Error loading map:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    if (!currentDay?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-traveler-id": currentUserId,
        },
        body: JSON.stringify({
          dayId: currentDay.id,
          forceRegenerate: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate map");
      }

      setMapData(data.map);
    } catch (err: any) {
      console.error("Error refreshing map:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Visual Maps</h2>
          <p className="text-sm text-muted-foreground">
            AI-illustrated poster-style maps for each day
          </p>
        </div>
        {isMarkUser && mapData && !loading && (
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        )}
      </div>

      {/* Day Navigation */}
      <DayNavigation
        days={days}
        selectedIndex={selectedDayIndex}
        onSelect={setSelectedDayIndex}
      />

      {/* Map Display */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">{currentDay?.title}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentDay?.date && (() => {
                // Parse as local date to avoid timezone issues
                const [year, month, day] = currentDay.date.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                });
              })()}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" />
              <p className="text-sm text-muted-foreground font-medium">
                Generating your visual map...
              </p>
              <p className="text-xs text-muted-foreground">
                This may take 15-30 seconds
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={() => loadMapForDay(currentDay?.id)} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && mapData && (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <img
                  src={mapData.image_url}
                  alt={`Visual map for ${currentDay?.title}`}
                  className="w-full h-full object-contain"
                />
                {mapData.is_fallback && (
                  <div className="absolute top-4 right-4 bg-yellow-500/90 text-yellow-950 px-3 py-1 rounded-full text-xs font-medium">
                    Fallback Poster
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Generated {new Date(mapData.generated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </span>
                {mapData.generated_by_traveler_id && (
                  <span>
                    Refreshed by {travelers.find(t => t.id === mapData.generated_by_traveler_id)?.name}
                  </span>
                )}
              </div>
            </div>
          )}

          {!loading && !error && !mapData && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <p className="text-sm text-muted-foreground">
                No map generated yet
              </p>
              <Button onClick={() => loadMapForDay(currentDay?.id)} variant="outline">
                Generate Map
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
