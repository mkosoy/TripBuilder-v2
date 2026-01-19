"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingUploadButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingUploadButton({ onClick, className }: FloatingUploadButtonProps) {
  return (
    <Button
      size="lg"
      className={cn(
        "fixed bottom-20 right-6 md:bottom-8 h-14 w-14 rounded-full shadow-lg z-40",
        "md:h-auto md:w-auto md:rounded-lg md:px-4",
        className
      )}
      onClick={onClick}
    >
      <Upload className="w-5 h-5 md:mr-2" />
      <span className="hidden md:inline">Upload Booking</span>
    </Button>
  );
}
