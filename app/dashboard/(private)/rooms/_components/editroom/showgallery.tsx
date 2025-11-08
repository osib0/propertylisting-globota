
"use client";

// import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import roomeditImg from "@/assets/images/others/roomedit.avif";
// import { Trash2 } from "lucide-react";
// import { TagMultiSelect } from "./tagselect";

const tagOptions = [
  { value: "activities", label: "Activities & Experiences" },
  { value: "banquet", label: "Banquet" },
  { value: "bar", label: "Bar" },
  { value: "barbeque", label: "Barbeque" },
  { value: "washroom", label: "Washroom" },
];

export default function ShowGallery({ setGallerySelector }: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnails = Array.from({ length: 10 });
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [tags, setTags] = useState<Array<{ value: string; label: string }[]>>(
    Array.from({ length: 10 }, () => [{ label: "Washroom", value: "washroom" }])
  );

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="rounded-2xl p-4 shadow border">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="font-bold">Inara Luxury Swiss Tent (10)</h4>
        <div className="flex gap-2">
          <Button variant="outline">Reorder</Button>
          <Button variant="destructive" onClick={() => setGallerySelector(true)}>Add Photos & Videos</Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2 hidden 2xl:flex flex-col gap-2 overflow-auto max-h-[500px]">
          {/* {thumbnails.map((_, i) => (
            <button
              key={i}
              onClick={() => handleThumbnailClick(i)}
              className={`rounded border ${activeIndex === i ? "border-primary" : "border-border"} p-1`}
            >
              <Image src={roomeditImg} width={130} height={130} alt="Room Thumbnail" className="rounded w-full h-auto" />
            </button>
          ))} */}
        </div>

        <div className="col-span-12 2xl:col-span-10 overflow-auto max-h-[500px] space-y-6">
          {/* {thumbnails.map((_, i) => (
            <div key={i} ref={(el) => (itemRefs.current[i] = el)} className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-6">
                <div className="relative">
                  <Image src={roomeditImg} alt="Room" width={1200} height={800} className="rounded w-full object-cover max-h-80" />
                  <Button variant="secondary" size="icon" className="absolute right-2 top-2 rounded-full" aria-label="delete image">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="absolute inset-0 flex items-center justify-center rounded bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-zoom-in text-white font-semibold">
                    Click to view
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-muted rounded-b">
                    <label className="flex items-center gap-2 text-xs font-semibold">
                      <Checkbox />
                      <span>Set as cover photo for Inara Luxury Swiss Tent</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-6 space-y-4">
                <div>
                  <div className="font-semibold mb-1">Tags Added</div>
                  <TagMultiSelect
                    options={tagOptions}
                    value={tags[i]}
                    onChange={(selected) => {
                      const next = [...tags];
                      next[i] = selected;
                      setTags(next);
                    }}
                    placeholder="Add Tags"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags[i]?.map((t) => (
                      <Badge key={t.value} variant="secondary">{t.label}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Photo & Video Assigned to</div>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox defaultChecked />
                    <span>Inara Luxury Swiss Tent</span>
                  </label>
                </div>
              </div>
            </div>
          ))} */}
        </div>
      </div>
    </div>
  );
}