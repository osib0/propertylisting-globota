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
  FormMessage,
  FormControl,
} from "@/components/ui/form";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash, ArrowRight, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/app/contextapi";
import Header from "./header";

// -------------------------
// Schema
// -------------------------
const formSchema = z.object({
  property_photos: z.array(
    z.object({
      url: z.string().url(),
    })
  ).min(3, "At least 3 photos are required"),
});


type PropertyPhotosSchema = z.infer<typeof formSchema>;

interface PropertyPhotosProps {
  setShareData: React.Dispatch<React.SetStateAction<any>>;
  shareData: any;
  defaultData: any;
}

export default function PropertyPhotos({
  setShareData,
  shareData,
  defaultData,
}: PropertyPhotosProps) {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setTab } = useAppContext();

  const form = useForm<PropertyPhotosSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      property_photos: shareData?.property_photos || defaultData || [],
    },
  });

  // Reset form when defaultData changes
  useEffect(() => {
    const defaultPhotos = defaultData?.property_photos;
    const sharedPhotos = shareData?.property_photos;

    if (photos?.length > 0) return;

    setLoading(true);
    setTimeout(() => {
      if (defaultPhotos?.length > 0) {
        form.reset({ property_photos: defaultPhotos });
      } else if (sharedPhotos?.length > 0) {
        form.reset({ property_photos: sharedPhotos });
      }
      setLoading(false);
    }, 600);
    console.log(shareData, 'shareData');

  }, [defaultData, form]);



  const photos = form.watch("property_photos");

  // Sync data with parent
  // const syncWithParent = useCallback(() => {
  //   setShareData((prev: any) => ({
  //     ...prev,
  //     property_photos: photos,
  //   }));
  // }, [defaultData, shareData,form]);

  useEffect(() => {
    setShareData((prev: any) => ({
      ...prev,
      property_photos: photos,
    }));
    console.log(shareData);

  }, [photos, setShareData]);

  // -------------------------
  // Upload Handler
  // -------------------------
  const handlePhotoUpload = async (files: File[]) => {
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
        const signedUrl: string = data.signedUrl || data.url;

        if (signedUrl) {
          form.setValue("property_photos", [
            ...photos,
            { url: signedUrl },
          ]);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    setUploading(false);
    form.trigger();
  };

  // -------------------------
  // Remove Photo
  // -------------------------
  const removePhoto = (idx: number) => {
    const updated = photos.filter((_, i) => i !== idx);
    form.setValue("property_photos", updated);
  };

  const handleNext = async () => {
    const valid = await form.trigger();
    if (valid) {
      setTab("Room Details")
    }
  };


  return (
    <div className="flex flex-col min-h-screen w-full bg-muted/30">
      <Form {...form}>
        <form className="flex flex-col flex-1">
          <Header
            status={form.formState.isValid}
            title="Property Photos"
            description="Upload property cover and gallery photos."
          />

          <div className="p-6 flex-1 overflow-y-auto space-y-6 max-w-7xl mx-auto bg-white w-full">
            <div>
              <h1 className="text-xl font-semibold mb-1">
                Upload Photos
              </h1>
              <p className="text-sm text-muted-foreground">
                Upload high-quality property images (JPG, PNG, WebP)
              </p>
            </div>
            <div className="flex gap-2 flex-wrap items-start">
              {/* Photo Grid */}
              {loading ? (
                <SkeletonGrid />
              ) : photos.length > 0 ? (
                <>
                  {photos.map((photo, idx) => (
                    <Card
                      key={idx}
                      className="relative overflow-hidden group p-0 shadow-none w-50 h-50 border rounded-xl"
                    >
                      <Image
                        src={photo.url}
                        alt={`photo-${idx}`}
                        width={400}
                        height={400}
                        className="object-cover w-full h-50 sm:h-56 rounded-xl transition-all duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePhoto(idx)}
                          className="flex items-center gap-1"
                        >
                          <Trash className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center  bg-muted/10 w-50 h-50 border rounded-xl">
                  <ImageIcon className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No photos uploaded yet
                  </p>
                </div>
              )}

              {/* Dropzone */}
              <FormField
                control={form.control}
                name="property_photos"
                render={() => (
                  <FormItem className="relative">
                    <FormControl>
                      <Dropzone
                        multiple
                        onFiles={(files) => handlePhotoUpload(files)}
                        note="Upload JPG, PNG,WebP"
                      />
                    </FormControl>
                    <FormMessage className="absolute -bottom-7 text-xs -translate-x-1/2 left-1/2 whitespace-nowrap" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setTab("Property Amenities")}
            >
              Back
            </Button>

            <Button
              type="button"
              disabled={uploading}
              className="flex items-center gap-2"
              onClick={handleNext}
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
// -------------------------
// Dropzone Component (Beautified)
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
      className={`relative border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
        w-50 h-50 border 
        ${isDragActive
          ? "border-primary bg-primary/10 shadow-md scale-[1.01]"
          : "border-muted bg-muted/5 hover:bg-muted/10 hover:border-primary/60"
        }`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center space-y-3">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center 
            ${isDragActive ? "bg-primary text-white" : "bg-muted text-primary"}`}
        >
          <ImageIcon className="w-7 h-7" />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            <strong>Drag & drop</strong> images here
          </p>
          <p className="text-sm text-muted-foreground">
            or{" "}
            <button
              type="button"
              onClick={open}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              browse files
            </button>
          </p>
        </div>

        {note && (
          <p className="text-xs text-muted-foreground mt-2">{note}</p>
        )}
      </div>

      {/* Animated border glow */}
      <div
        className={`absolute inset-0 rounded-xl border-2 border-primary/30 opacity-0 
          transition-opacity duration-300 pointer-events-none
          ${isDragActive ? "opacity-100" : "opacity-0"}`}
      ></div>
    </div>
  );
}


// -------------------------
// Skeleton Grid Component
// -------------------------
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 my-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="w-full h-48 sm:h-56 rounded-xl" />
      ))}
    </div>
  );
}
