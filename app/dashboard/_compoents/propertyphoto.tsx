"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Images, Trash, ArrowRight } from "lucide-react";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

// -------------------------
// Constants & Schema
// -------------------------
const CATEGORIES = [
  "Entrance/Facade",
  "Reception",
  "Lobby",
  "Restaurant",
  "Parking",
  "Terrace",
  "Public Area",
  "Events",
  "Swimming Pool",
  "Bar",
  "Cafe",
] as const;

const formSchema = z.object({
  property_photos: z.record(
    z.string(), 
    z.array(
      z.object({
        url: z.string().url(),
      })
    )
  ),
});

type PropertyPhotosSchema = z.infer<typeof formSchema>;

// -------------------------
// Props Interface
// -------------------------
interface PropertyPhotosProps {
  setShareData: React.Dispatch<React.SetStateAction<any>>;
  shareData: any;
}

// -------------------------
// Component
// -------------------------
export default function PropertyPhotos({
  setShareData,
  shareData,
}: PropertyPhotosProps) {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>(
    CATEGORIES[0]
  );
  const [uploading, setUploading] = useState(false);

  const form = useForm<PropertyPhotosSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      property_photos: CATEGORIES.reduce(
        (acc, cat) => ({
          ...acc,
          [cat]: shareData?.property_photos?.[cat] || [],
        }),
        {} as Record<string, { url: string }[]>
      ),
    },
  });

  const photosByCategory:any = form.watch("property_photos");

  const syncWithParent = useCallback(() => {
    setShareData((prev: any) => ({
      ...prev,
      property_photos: photosByCategory,
    }));
  }, [photosByCategory, setShareData]);

  useEffect(() => {
    syncWithParent();
  }, [syncWithParent]);

  // -------------------------
  // Upload Handler
  // -------------------------
  const handlePhotoUpload = async (files: File[], category: string) => {
    setUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "property_photos");

      try {
        const res = await fetch("/api/photos/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const signedUrl: string | undefined = data.signedUrl || data.url;

        if (signedUrl) {
          const updated = [...(photosByCategory[category] || []), { url: signedUrl }];
          form.setValue(`property_photos.${category}`, updated);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    setUploading(false);
  };

  // -------------------------
  // Remove Photo
  // -------------------------
const removePhoto = (category: string, idx: number) => {
  const updated = photosByCategory[category].filter((category:string, i: number) => i !== idx);
  form.setValue(`property_photos.${category}`, updated);
};


  // -------------------------
  // JSX
  // -------------------------
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Form {...form}>
        <form className="flex flex-col flex-1">
          {/* Header */}
          <div className="border-b bg-white py-4 px-6 sticky top-0 z-20 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Images className="w-5 h-5 text-muted-foreground" />
                Property Photos
              </h2>
              <Badge variant="secondary">Step 4 of 6</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload cover and gallery photos for each category.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="p-6 flex-1 overflow-y-auto">
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">
              Categories
            </h4>

            <Tabs value={activeCategory} onValueChange={(val) => setActiveCategory(val as (typeof CATEGORIES)[number])}>
              <TabsList className="flex flex-wrap gap-2 mb-4">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              {CATEGORIES.map((cat) => (
                <TabsContent key={cat} value={cat} className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`property_photos.${cat}`}
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{cat}</FormLabel>
                        <FormControl>
                          <Dropzone
                            multiple
                            onFiles={(files) => handlePhotoUpload(files, cat)}
                            note="Upload high-quality JPG, PNG, or WebP images."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Photo Grid */}
                  {photosByCategory[cat]?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {photosByCategory[cat].map((photo: { url: string | StaticImport; }, idx: number) => (
                        <Card
                          key={idx}
                          className="relative overflow-hidden group rounded-xl border"
                        >
                          <Image
                            src={photo.url}
                            alt={`photo-${idx}`}
                            width={300}
                            height={200}
                            className="object-cover w-full h-40"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removePhoto(cat, idx)}
                              className="flex items-center gap-1"
                            >
                              <Trash className="w-4 h-4" />
                              Remove
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Footer */}
          <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center">
            <Button
              type="button"
              disabled={uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> Uploading...
                </>
              ) : (
                <>
                  Next Step <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// -------------------------
// Dropzone Component
// -------------------------
function Dropzone({
  onFiles,
  multiple = true,
  note,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  note?: string;
}) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acc: File[]) => onFiles(acc),
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple,
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
        isDragActive ? "border-primary bg-primary/5" : "border-muted"
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-sm text-muted-foreground">
        <strong>Drag & drop</strong> files here, or{" "}
        <button
          type="button"
          onClick={open}
          className="text-primary underline font-medium"
        >
          browse
        </button>
      </p>
      {note && <p className="text-xs text-muted-foreground mt-1">{note}</p>}
    </div>
  );
}
