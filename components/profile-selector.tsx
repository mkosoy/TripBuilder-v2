"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Traveler } from "@/lib/trip-data";
import { User, Upload, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSelectorProps {
  travelers: Traveler[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
  onUpdateAvatar?: (userId: string, avatarUrl: string) => void;
}

export function ProfileSelector({
  travelers,
  currentUserId,
  onSelectUser,
  onUpdateAvatar,
}: ProfileSelectorProps) {
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = travelers.find((t) => t.id === currentUserId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = () => {
    if (avatarUrl && onUpdateAvatar) {
      onUpdateAvatar(currentUserId, avatarUrl);
      setAvatarUrl("");
      setShowAvatarUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-auto py-1 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.name} />
              <AvatarFallback style={{ backgroundColor: currentUser?.color }}>
                {currentUser?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{currentUser?.name}</span>
              <span className="text-xs text-muted-foreground">Switch profile</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Select Your Profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {travelers.map((traveler) => (
            <DropdownMenuItem
              key={traveler.id}
              onClick={() => onSelectUser(traveler.id)}
              className="flex items-center gap-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={traveler.avatar || "/placeholder.svg"} alt={traveler.name} />
                <AvatarFallback style={{ backgroundColor: traveler.color }}>
                  {traveler.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{traveler.name}</span>
              {traveler.id === currentUserId && (
                <span className="ml-auto text-xs text-muted-foreground">Active</span>
              )}
            </DropdownMenuItem>
          ))}
          {onUpdateAvatar && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAvatarUpload(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Change Profile Photo
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAvatarUpload} onOpenChange={setShowAvatarUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
            <DialogDescription>
              Upload an image or enter a URL for your new profile photo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Toggle between upload methods */}
            <div className="flex gap-2 border-b">
              <Button
                variant={uploadMethod === "file" ? "default" : "ghost"}
                size="sm"
                onClick={() => setUploadMethod("file")}
                className="flex-1"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button
                variant={uploadMethod === "url" ? "default" : "ghost"}
                size="sm"
                onClick={() => setUploadMethod("url")}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Enter URL
              </Button>
            </div>

            {uploadMethod === "file" ? (
              <div className="space-y-2">
                <Label htmlFor="avatar-file">Choose an Image</Label>
                <div className="flex flex-col items-center gap-4">
                  <input
                    ref={fileInputRef}
                    id="avatar-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select Image
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Maximum file size: 5MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="avatar-url">Image URL</Label>
                <Input
                  id="avatar-url"
                  placeholder="https://example.com/photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            )}

            {avatarUrl && (
              <div className="flex items-center justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Preview" />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowAvatarUpload(false);
              setAvatarUrl("");
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}>
              Cancel
            </Button>
            <Button onClick={handleAvatarUpload} disabled={!avatarUrl}>
              Update Photo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
