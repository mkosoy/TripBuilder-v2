"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MustDoItem, Traveler, DayItinerary } from "@/lib/trip-data";
import {
  ArrowUp,
  MessageCircle,
  Send,
  Calendar,
  MapPin,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MustDoDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mustDo: MustDoItem;
  travelers: Traveler[];
  days: DayItinerary[];
  currentUserId: string;
  onVote: () => void;
  onAddComment: (comment: string) => void;
  onAddToItinerary: (dayDate: string) => void;
  onDelete?: () => void;
}

export function MustDoDetailModal({
  open,
  onOpenChange,
  mustDo,
  travelers,
  days,
  currentUserId,
  onVote,
  onAddComment,
  onAddToItinerary,
  onDelete,
}: MustDoDetailModalProps) {
  const [comment, setComment] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("");

  const traveler = travelers.find((t) => t.id === mustDo.travelerId);
  const hasVoted = mustDo.votes.includes(currentUserId);
  const isCopenhagen = mustDo.destination === "copenhagen";

  const availableDays = days.filter((day) => day.destination === mustDo.destination);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    onAddComment(comment.trim());
    setComment("");
  };

  const handleAddToItinerary = () => {
    if (!selectedDay) return;
    onAddToItinerary(selectedDay);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <DialogTitle className="text-xl text-balance">{mustDo.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      isCopenhagen
                        ? "border-copenhagen text-copenhagen"
                        : "border-iceland text-iceland"
                    )}
                  >
                    {mustDo.destination === "copenhagen" ? "Copenhagen" : "Reykjavik"}
                  </Badge>
                  <Badge variant="outline">{mustDo.type}</Badge>
                  {mustDo.priceRange && (
                    <Badge variant="secondary">{mustDo.priceRange}</Badge>
                  )}
                  {mustDo.addedToItinerary && (
                    <Badge className="bg-success/10 text-success border-success/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Added to Itinerary
                    </Badge>
                  )}
                </div>
              </div>

              {/* Vote Button */}
              <Button
                size="lg"
                variant={hasVoted ? "default" : "outline"}
                onClick={onVote}
                className="flex-col h-auto py-2 px-4"
              >
                <ArrowUp className={cn("w-5 h-5 mb-1", hasVoted && "fill-current")} />
                <span className="text-lg font-semibold">{mustDo.votes.length}</span>
                <span className="text-xs">votes</span>
              </Button>
            </div>

            {traveler && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6" style={{ backgroundColor: traveler.color }}>
                  <AvatarFallback className="text-white text-xs">
                    {getInitials(traveler.name)}
                  </AvatarFallback>
                </Avatar>
                <span>Suggested by {traveler.name}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          {mustDo.description && (
            <div>
              <h4 className="font-medium mb-2 text-foreground">Description</h4>
              <p className="text-sm text-muted-foreground text-pretty">
                {mustDo.description}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            {mustDo.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground">{mustDo.address}</span>
              </div>
            )}

            {mustDo.bookingUrl && (
              <div className="flex items-start gap-3 text-sm">
                <ExternalLink className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <a
                  href={mustDo.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {mustDo.bookingUrl}
                </a>
              </div>
            )}

            {mustDo.priceRange && (
              <div className="flex items-start gap-3 text-sm">
                <DollarSign className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground">
                  {mustDo.priceRange === "$" && "Budget-friendly"}
                  {mustDo.priceRange === "$$" && "Moderate pricing"}
                  {mustDo.priceRange === "$$$" && "Upscale"}
                  {mustDo.priceRange === "$$$$" && "Luxury / High-end"}
                </span>
              </div>
            )}
          </div>

          {mustDo.notes && (
            <div>
              <h4 className="font-medium mb-2 text-foreground">Notes</h4>
              <p className="text-sm text-muted-foreground text-pretty">{mustDo.notes}</p>
            </div>
          )}

          {/* Add to Itinerary */}
          {!mustDo.addedToItinerary && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 text-foreground">Add to Itinerary</h4>
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="select-day">Select Day</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger id="select-day">
                      <SelectValue placeholder="Choose a day..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDays.map((day) => (
                        <SelectItem key={day.date} value={day.date}>
                          {day.dayOfWeek}, {day.date} - {day.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddToItinerary} disabled={!selectedDay}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Day
                </Button>
              </div>
            </div>
          )}

          {mustDo.addedToItinerary && mustDo.addedToDay && (
            <div className="bg-success/5 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Added to {mustDo.addedToDay}</span>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comments ({mustDo.comments.length})
            </h4>

            {/* Comment List */}
            <ScrollArea className="h-[200px] mb-4">
              {mustDo.comments.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  {mustDo.comments.map((c) => {
                    const commentTraveler = travelers.find((t) => t.id === c.travelerId);
                    return (
                      <div key={c.id} className="flex gap-3">
                        {commentTraveler && (
                          <Avatar
                            className="h-8 w-8 flex-shrink-0"
                            style={{ backgroundColor: commentTraveler.color }}
                          >
                            <AvatarFallback className="text-white text-xs">
                              {getInitials(commentTraveler.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {commentTraveler?.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground text-pretty">{c.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Add Comment */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button onClick={handleAddComment} disabled={!comment.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1">
            {onDelete && mustDo.travelerId === currentUserId && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm(`Delete "${mustDo.name}"? This cannot be undone.`)) {
                    onDelete();
                    onOpenChange(false);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
