"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Traveler, MustDoItem, DayItinerary } from "@/lib/trip-data";
import { ArrowUp, MessageCircle, Plus, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddMustDoModal } from "@/components/add-mustdo-modal";
import { MustDoDetailModal } from "@/components/mustdo-detail-modal";

interface TravelersPanelProps {
  travelers: Traveler[];
  mustDos: MustDoItem[];
  days: DayItinerary[];
  currentUserId: string;
  onVoteMustDo: (mustDoId: string, travelerId: string) => void;
  onAddComment: (mustDoId: string, travelerId: string, comment: string) => void;
  onAddMustDo: (mustDo: Omit<MustDoItem, "id" | "votes" | "comments" | "addedToItinerary">) => void;
  onAddToItinerary: (mustDoId: string, dayDate: string) => void;
  onDeleteMustDo?: (mustDoId: string) => void;
}

export function TravelersPanel({
  travelers,
  mustDos,
  days,
  currentUserId,
  onVoteMustDo,
  onAddComment,
  onAddMustDo,
  onAddToItinerary,
  onDeleteMustDo,
}: TravelersPanelProps) {
  const [selectedTravelerId, setSelectedTravelerId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMustDo, setSelectedMustDo] = useState<MustDoItem | null>(null);
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");

  const selectedTraveler = selectedTravelerId
    ? travelers.find((t) => t.id === selectedTravelerId)
    : null;

  const filteredMustDos = selectedTravelerId
    ? mustDos.filter((m) => m.travelerId === selectedTravelerId)
    : mustDos;

  const sortedMustDos = [...filteredMustDos].sort((a, b) => {
    if (sortBy === "votes") {
      return b.votes.length - a.votes.length;
    }
    return 0; // recent would need timestamp
  });

  const topVoted = [...mustDos].sort((a, b) => b.votes.length - a.votes.length).slice(0, 5);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const currentUser = travelers.find((t) => t.id === currentUserId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Travel Squad</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Share must-dos and plan together
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Must-Do
        </Button>
      </div>

      {/* Traveler Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {travelers.map((traveler) => {
          const travelerMustDos = mustDos.filter((m) => m.travelerId === traveler.id);
          const isSelected = selectedTravelerId === traveler.id;

          return (
            <Card
              key={traveler.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary shadow-md"
              )}
              onClick={() =>
                setSelectedTravelerId(isSelected ? null : traveler.id)
              }
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={traveler.avatar || "/placeholder.svg"} alt={traveler.name} />
                  <AvatarFallback
                    className="text-white font-medium"
                    style={{ backgroundColor: traveler.color }}
                  >
                    {getInitials(traveler.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-foreground">{traveler.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {travelerMustDos.length} must-dos
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Must-Dos Section */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setSelectedTravelerId(null)}>
              All Must-Dos
            </TabsTrigger>
            <TabsTrigger value="top">Top Voted</TabsTrigger>
            {selectedTraveler && (
              <TabsTrigger value="selected">{selectedTraveler.name}'s List</TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-3">
          <ScrollArea className="h-[500px] pr-4">
            {sortedMustDos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No must-dos yet. Add some activities you want to do!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedMustDos.map((mustDo) => (
                  <MustDoCard
                    key={mustDo.id}
                    mustDo={mustDo}
                    travelers={travelers}
                    currentUserId={currentUserId}
                    onVote={() => onVoteMustDo(mustDo.id, currentUserId)}
                    onClick={() => setSelectedMustDo(mustDo)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="top" className="space-y-3">
          <ScrollArea className="h-[500px] pr-4">
            {topVoted.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No votes yet. Start voting on must-dos!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topVoted.map((mustDo, index) => (
                  <div key={mustDo.id} className="relative">
                    {index < 3 && (
                      <Badge
                        className="absolute -top-2 -left-2 z-10"
                        variant={index === 0 ? "default" : "secondary"}
                      >
                        #{index + 1}
                      </Badge>
                    )}
                    <MustDoCard
                      mustDo={mustDo}
                      travelers={travelers}
                      currentUserId={currentUserId}
                      onVote={() => onVoteMustDo(mustDo.id, currentUserId)}
                      onClick={() => setSelectedMustDo(mustDo)}
                    />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {selectedTraveler && (
          <TabsContent value="selected" className="space-y-3">
            <ScrollArea className="h-[500px] pr-4">
              {filteredMustDos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{selectedTraveler.name} hasn't added any must-dos yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMustDos.map((mustDo) => (
                    <MustDoCard
                      key={mustDo.id}
                      mustDo={mustDo}
                      travelers={travelers}
                      currentUserId={currentUserId}
                      onVote={() => onVoteMustDo(mustDo.id, currentUserId)}
                      onClick={() => setSelectedMustDo(mustDo)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>

      <AddMustDoModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        travelers={travelers}
        currentUserId={currentUserId}
        onAdd={(mustDo) => {
          onAddMustDo(mustDo);
          setShowAddModal(false);
        }}
      />

      {selectedMustDo && (
        <MustDoDetailModal
          open={!!selectedMustDo}
          onOpenChange={(open) => !open && setSelectedMustDo(null)}
          mustDo={selectedMustDo}
          travelers={travelers}
          days={days}
          currentUserId={currentUserId}
          onVote={() => onVoteMustDo(selectedMustDo.id, currentUserId)}
          onAddComment={(comment) =>
            onAddComment(selectedMustDo.id, currentUserId, comment)
          }
          onAddToItinerary={(dayDate) => {
            onAddToItinerary(selectedMustDo.id, dayDate);
            setSelectedMustDo(null);
          }}
          onDelete={
            onDeleteMustDo
              ? () => {
                  onDeleteMustDo(selectedMustDo.id);
                  setSelectedMustDo(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

interface MustDoCardProps {
  mustDo: MustDoItem;
  travelers: Traveler[];
  currentUserId: string;
  onVote: () => void;
  onClick: () => void;
}

function MustDoCard({ mustDo, travelers, currentUserId, onVote, onClick }: MustDoCardProps) {
  const traveler = travelers.find((t) => t.id === mustDo.travelerId);
  const hasVoted = mustDo.votes.includes(currentUserId);
  const isCopenhagen = mustDo.destination === "copenhagen";

  return (
    <Card
      className="p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-medium text-foreground text-balance">{mustDo.name}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  isCopenhagen ? "border-copenhagen text-copenhagen" : "border-iceland text-iceland"
                )}
              >
                {mustDo.destination === "copenhagen" ? "Copenhagen" : "Reykjavik"}
              </Badge>
              {mustDo.addedToItinerary && (
                <Badge className="bg-success/10 text-success border-success/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Added
                </Badge>
              )}
            </div>
            {mustDo.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">
                {mustDo.description}
              </p>
            )}
          </div>

          {/* Vote Button */}
          <Button
            variant={hasVoted ? "default" : "outline"}
            className="flex-shrink-0 h-10 px-4 rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              onVote();
            }}
          >
            <ArrowUp className={cn("w-4 h-4 mr-1.5", hasVoted && "fill-current")} />
            {mustDo.votes.length}
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {traveler && (
              <div className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: traveler.color }}
                />
                <span>{traveler.name}</span>
              </div>
            )}
            {mustDo.priceRange && (
              <Badge variant="secondary" className="text-xs">
                {mustDo.priceRange}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {mustDo.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {mustDo.comments.length}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {mustDo.type}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
