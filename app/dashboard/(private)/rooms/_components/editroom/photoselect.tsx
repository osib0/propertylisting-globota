
"use client";

import { useState } from "react";
// import Image from "next/image";
// import roomeditImg from "@/assets/images/others/roomedit.avif";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";

// const mediaItems = [
//   { type: "image" as const, src: roomeditImg },
//   { type: "image" as const, src: roomeditImg },
//   { type: "video" as const, src: "/media/video1.mp4" },
//   { type: "image" as const, src: roomeditImg },
//   { type: "image" as const, src: roomeditImg },
//   { type: "image" as const, src: roomeditImg },
//   { type: "video" as const, src: "/media/video1.mp4" },
//   { type: "video" as const, src: "/media/video2.mp4" },
//   { type: "image" as const, src: roomeditImg },
// ];

export default function PhotoSelectorModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const toggleSelect = (index: number) => setSelected((p) => (p.includes(index) ? p.filter((i) => i !== index) : [...p, index]));
  const deselectAll = () => setSelected([]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Select or Upload Photos & Videos for Inara Luxury Swiss Tent</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Photos help customers visualize what the room looks like</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {/* {mediaItems.map((item, index) => (
            <div key={index} className="relative rounded border overflow-hidden cursor-pointer" onClick={() => toggleSelect(index)}>
              {item.type === "image" ? (
                <Image src={item.src} alt={`media-${index}`} width={600} height={450} className="w-full object-cover aspect-[4/3]" />
              ) : (
                <video className="w-full aspect-[4/3]" controls>
                  <source src={item.src} />
                </video>
              )}
              <div className="absolute top-2 right-2 bg-background rounded p-1">
                <Checkbox checked={selected.includes(index)} onCheckedChange={() => toggleSelect(index)} />
              </div>
            </div>
          ))} */}
        </div>
        <div className="flex items-center justify-between mt-4">
          <button className="text-primary underline" onClick={deselectAll}>Deselect All</button>
          <div className="flex gap-2">
            <Button size="sm">Upload New</Button>
            <Button size="sm" variant="secondary">Assign</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
