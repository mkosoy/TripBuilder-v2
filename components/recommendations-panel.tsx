"use client";

import React from "react"

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Destination, Activity, SavedPlace, ActivityType } from "@/lib/trip-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Plus,
  Bookmark,
  ExternalLink,
  UtensilsCrossed,
  Wine,
  Mountain,
  Camera,
} from "lucide-react";

interface RecommendationsPanelProps {
  currentDestination: Destination;
  onAddPlace: (place: SavedPlace) => void;
  onAddToDay: (activity: Activity) => void;
}

// Curated recommendations for each destination
const recommendations = {
  copenhagen: {
    restaurants: [
      {
        name: "Hart Bakery",
        description: "Best sourdough in Copenhagen, 4 locations around the city",
        priceRange: "$" as const,
      },
      {
        name: "Hija de Sanchez",
        description: "Amazing tacos by ex-Noma chef. Fresh tortillas made on-site",
        priceRange: "$$" as const,
      },
      {
        name: "Gasoline Grill",
        description: "Best burgers in Copenhagen. Simple menu, perfect execution",
        priceRange: "$" as const,
      },
      {
        name: "Baest",
        description: "Wood-fired pizza in Norrebro with house-made mozzarella",
        priceRange: "$$" as const,
      },
    ],
    bars: [
      {
        name: "Lidkoeb",
        description: "Multi-floor cocktail bar in Vesterbro. Try the whiskey selection upstairs",
        priceRange: "$$$" as const,
      },
      {
        name: "Copenhagen JazzHouse",
        description: "Winter Jazz Festival venue - live jazz every night",
        priceRange: "$$" as const,
        bookingUrl: "https://jazzhouse.dk/",
      },
      {
        name: "Rust",
        description: "3 floors of indie and electronic music in Norrebro",
        priceRange: "$$" as const,
      },
    ],
    attractions: [
      {
        name: "National Museum of Denmark",
        description: "Free entry, Viking artifacts, Danish history. Near your hotel",
        priceRange: "$" as const,
        bookingUrl: "https://en.natmus.dk/",
      },
      {
        name: "Louisiana Museum of Modern Art",
        description: "World-class modern art with stunning seaside views. 35 min train ride",
        priceRange: "$$" as const,
        bookingUrl: "https://louisiana.dk/en/",
      },
    ],
  },
  reykjavik: {
    restaurants: [
      {
        name: "Grillid",
        description: "Top floor of Radisson, panoramic views, Icelandic tasting menu",
        priceRange: "$$$$" as const,
        bookingUrl: "https://www.grillid.is/",
      },
      {
        name: "Messinn",
        description: "Fresh fish in sizzling iron skillets. Generous portions, great value",
        priceRange: "$$" as const,
      },
      {
        name: "Icelandic Street Food",
        description: "Lamb or fish soup in a bread bowl. Free refills! ~$15",
        priceRange: "$" as const,
      },
      {
        name: "Hlemmur Matholl",
        description: "Food hall with multiple vendors - great for groups with different tastes",
        priceRange: "$$" as const,
      },
    ],
    bars: [
      {
        name: "Kaldi Bar",
        description: "Icelandic craft brewery tap room. Try the dark lager",
        priceRange: "$$" as const,
      },
      {
        name: "Pablo Discobar",
        description: "Quirky cocktail bar with 80s vibes. Great for groups",
        priceRange: "$$" as const,
      },
      {
        name: "Petersen Svitan",
        description: "Rooftop bar with views. Open in winter when weather permits",
        priceRange: "$$$" as const,
      },
    ],
    attractions: [
      {
        name: "Laugardalslaug",
        description: "Local swimming pool with hot tubs and sauna. Authentic Icelandic experience",
        priceRange: "$" as const,
      },
      {
        name: "National Museum of Iceland",
        description: "Viking history and Icelandic culture. Great for bad weather days",
        priceRange: "$" as const,
        bookingUrl: "https://www.thjodminjasafn.is/english",
      },
      {
        name: "Reykjavik Art Museum",
        description: "Three locations around the city. One ticket covers all",
        priceRange: "$" as const,
      },
    ],
  },
};

export function RecommendationsPanel({
  currentDestination,
  onAddPlace,
  onAddToDay,
}: RecommendationsPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "restaurant" as SavedPlace["category"],
    description: "",
    priceRange: "$$" as SavedPlace["priceRange"],
    bookingUrl: "",
  });

  const isCopenhagen = currentDestination === "copenhagen";
  const recs = recommendations[currentDestination];

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const typeMap: Record<SavedPlace["category"], ActivityType> = {
      restaurant: "food",
      bar: "nightlife",
      cafe: "food",
      attraction: "attraction",
      tour: "tour",
      other: "attraction",
    };

    onAddPlace({
      id: `custom-${Date.now()}`,
      name: formData.name,
      type: typeMap[formData.category],
      destination: currentDestination,
      category: formData.category,
      description: formData.description || undefined,
      priceRange: formData.priceRange,
      bookingUrl: formData.bookingUrl || undefined,
    });

    setFormData({
      name: "",
      category: "restaurant",
      description: "",
      priceRange: "$$",
      bookingUrl: "",
    });
    setShowAddForm(false);
  };

  const handleAddRecommendation = (
    rec: { name: string; description: string; priceRange?: SavedPlace["priceRange"]; bookingUrl?: string },
    category: SavedPlace["category"]
  ) => {
    const typeMap: Record<SavedPlace["category"], ActivityType> = {
      restaurant: "food",
      bar: "nightlife",
      cafe: "food",
      attraction: "attraction",
      tour: "tour",
      other: "attraction",
    };

    onAddPlace({
      id: `rec-${Date.now()}`,
      name: rec.name,
      type: typeMap[category],
      destination: currentDestination,
      category,
      description: rec.description,
      priceRange: rec.priceRange,
      bookingUrl: rec.bookingUrl,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Recommendations
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Your Own
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Budget-friendly picks for {isCopenhagen ? "Copenhagen" : "Reykjavik"}
          </p>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleAddCustom} className="mb-6 p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="space-y-2">
                <Label htmlFor="rec-name">Name *</Label>
                <Input
                  id="rec-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My favorite restaurant"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rec-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v: SavedPlace["category"]) =>
                      setFormData({ ...formData, category: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="cafe">Cafe</SelectItem>
                      <SelectItem value="attraction">Attraction</SelectItem>
                      <SelectItem value="tour">Tour</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rec-price">Price</Label>
                  <Select
                    value={formData.priceRange}
                    onValueChange={(v: SavedPlace["priceRange"]) =>
                      setFormData({ ...formData, priceRange: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$">$ (Budget)</SelectItem>
                      <SelectItem value="$$">$$ (Moderate)</SelectItem>
                      <SelectItem value="$$$">$$$ (Upscale)</SelectItem>
                      <SelectItem value="$$$$">$$$$ (Splurge)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rec-desc">Description</Label>
                <Textarea
                  id="rec-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What makes this place special?"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rec-url">Website/Booking URL</Label>
                <Input
                  id="rec-url"
                  value={formData.bookingUrl}
                  onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  className={cn(
                    isCopenhagen
                      ? "bg-copenhagen hover:bg-copenhagen/90"
                      : "bg-iceland hover:bg-iceland/90"
                  )}
                >
                  <Bookmark className="w-4 h-4 mr-1" />
                  Save Place
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <Tabs defaultValue="restaurants">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="restaurants" className="text-xs">
                <UtensilsCrossed className="w-3 h-3 mr-1" />
                Food
              </TabsTrigger>
              <TabsTrigger value="bars" className="text-xs">
                <Wine className="w-3 h-3 mr-1" />
                Bars
              </TabsTrigger>
              <TabsTrigger value="attractions" className="text-xs">
                <Camera className="w-3 h-3 mr-1" />
                See & Do
              </TabsTrigger>
            </TabsList>

            <TabsContent value="restaurants" className="space-y-2">
              {recs.restaurants.map((rec) => (
                <RecommendationCard
                  key={rec.name}
                  rec={rec}
                  category="restaurant"
                  isCopenhagen={isCopenhagen}
                  onSave={() => handleAddRecommendation(rec, "restaurant")}
                  onAddToDay={() =>
                    onAddToDay({
                      id: `rec-activity-${Date.now()}`,
                      name: rec.name,
                      type: "food",
                      description: rec.description,
                      priceRange: rec.priceRange,
                      bookingUrl: rec.bookingUrl,
                    })
                  }
                />
              ))}
            </TabsContent>

            <TabsContent value="bars" className="space-y-2">
              {recs.bars.map((rec) => (
                <RecommendationCard
                  key={rec.name}
                  rec={rec}
                  category="bar"
                  isCopenhagen={isCopenhagen}
                  onSave={() => handleAddRecommendation(rec, "bar")}
                  onAddToDay={() =>
                    onAddToDay({
                      id: `rec-activity-${Date.now()}`,
                      name: rec.name,
                      type: "nightlife",
                      description: rec.description,
                      priceRange: rec.priceRange,
                      bookingUrl: rec.bookingUrl,
                    })
                  }
                />
              ))}
            </TabsContent>

            <TabsContent value="attractions" className="space-y-2">
              {recs.attractions.map((rec) => (
                <RecommendationCard
                  key={rec.name}
                  rec={rec}
                  category="attraction"
                  isCopenhagen={isCopenhagen}
                  onSave={() => handleAddRecommendation(rec, "attraction")}
                  onAddToDay={() =>
                    onAddToDay({
                      id: `rec-activity-${Date.now()}`,
                      name: rec.name,
                      type: "attraction",
                      description: rec.description,
                      priceRange: rec.priceRange,
                      bookingUrl: rec.bookingUrl,
                    })
                  }
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface RecommendationCardProps {
  rec: {
    name: string;
    description: string;
    priceRange?: SavedPlace["priceRange"];
    bookingUrl?: string;
  };
  category: string;
  isCopenhagen: boolean;
  onSave: () => void;
  onAddToDay: () => void;
}

function RecommendationCard({ rec, isCopenhagen, onSave, onAddToDay }: RecommendationCardProps) {
  return (
    <div className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{rec.name}</span>
            {rec.priceRange && (
              <span className="text-xs text-muted-foreground">{rec.priceRange}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
          {rec.bookingUrl && (
            <a
              href={rec.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              Website
            </a>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onSave}
          >
            <Bookmark className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 text-xs",
              isCopenhagen ? "text-copenhagen" : "text-iceland"
            )}
            onClick={onAddToDay}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
