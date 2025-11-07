"use client";

import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Loader2,
  Trash2,
  Star,
  ArrowRight,
  ImageIcon,
  Images,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { useAppContext } from "@/app/contextapi";
import Header from "./header";
import { Skeleton } from "@/components/ui/skeleton";

// --------------------
// Schema
// --------------------
const RoomPhotoSchema = z.object({
  category: z.string(),
  photos: z
    .array(
      z.object({
        fileName: z.string(),
        url: z.string().url(),
      })
    )
    .min(2, "At least 2 photos required for this room."),
  coverPhotoIndex: z.number(),
});

const RoomPhotosSchema = z.object({
  room_photos: z.array(RoomPhotoSchema),
});

type RoomPhotosType = z.infer<typeof RoomPhotosSchema>;

// --------------------
// Dropzone
// --------------------
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
    onDrop: (accepted: File[]) => onFiles(accepted),
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple,
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative w-50 h-50 border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all
        ${isDragActive
          ? "border-primary bg-primary/10 shadow-md scale-[1.01]"
          : "border-muted bg-muted/5 hover:bg-muted/10 hover:border-primary/60"
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-1">
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
    </div>
  );
}

// --------------------
// Main Component
// --------------------
export default function RoomPhotos({ setShareData, shareData, defaultData }: any) {
  const { setTab } = useAppContext();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<RoomPhotosType>({
    resolver: zodResolver(RoomPhotosSchema),
    mode: "onChange",
    defaultValues: { room_photos: [] },
  });

  const { watch, setValue, formState } = form;
  const roomPhotos = watch("room_photos");

  // Load data from shared or default
  useEffect(() => {
    if (shareData?.room_detail?.length) {
      setLoading(true);
      setTimeout(() => {
        const initial = shareData.room_detail.map((room: any) => {
          const existing =
            shareData.room_photos?.find((r: any) => r.category === room.roomName) ||
            defaultData?.find((r: any) => r.category === room.roomName);

          return (
            existing || {
              category: room.roomName,
              photos: [],
              coverPhotoIndex: 0,
            }
          );
        });
        setValue("room_photos", initial);
        setLoading(false);
      }, 500);
    }
  }, []);

  // Sync parent
  useEffect(() => {
    setShareData((prev: any) => ({
      ...prev,
      room_photos: roomPhotos,
    }));
  }, [roomPhotos]);

  const handleUpload = async (category: string, files: File[]) => {
    setUploading(true);

    // 1️⃣ Local preview dikhao
    const tempPhotos = files.map((file) => ({
      fileName: file.name,
      url: URL.createObjectURL(file),
    }));

    // Pehle temp photos add karo
    const updatedRooms = roomPhotos.map((room) =>
      room.category === category
        ? { ...room, photos: [...room.photos, ...tempPhotos] }
        : room
    );
    setValue("room_photos", updatedRooms);

    // 2️⃣ Upload to AWS aur replace karo
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `room_photos/${category}`);

      try {
        const res = await fetch("/api/photos/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.url) {
          // Replace only the uploaded photo
          const newRooms = form.getValues("room_photos").map((room) =>
            room.category === category
              ? {
                ...room,
                photos: room.photos.map((p) =>
                  p.fileName === file.name ? { ...p, url: data.url } : p
                ),
              }
              : room
          );
          setValue("room_photos", newRooms);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    setUploading(false);
  };



  const removePhoto = (category: string, index: number) => {
    setValue(
      "room_photos",
      roomPhotos.map((room) =>
        room.category === category
          ? { ...room, photos: room.photos.filter((_, i) => i !== index) }
          : room
      )
    );
  };

  const setCoverPhoto = (category: string, index: number) => {
    setValue(
      "room_photos",
      roomPhotos.map((room) =>
        room.category === category
          ? { ...room, coverPhotoIndex: index }
          : room
      )
    );
  };

  const handleNext = async () => {
    const valid = await form.trigger();
    if (valid) setTab("Documents");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-muted/30">
      <Header
        status={formState.isValid}
        title="Room Photos"
        description="Upload and manage photos for each room category."
      />
      <Form {...form}>
        <form className="flex flex-col flex-1">

          <div className="p-6 flex-1 overflow-y-auto space-y-6 max-w-7xl mx-auto bg-white w-full">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              Upload Room Photos
              {shareData?.room_detail?.length ? (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({shareData.room_detail.length} {shareData.room_detail.length > 1 ? "Rooms" : "Room"})
                </span>
              ) : null}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add photos for every room category to showcase its look and design.
            </p>

            {loading ? (
              <SkeletonGrid />
            ) : (
              roomPhotos.map((room, idx) => (
                <FormField
                  key={idx}
                  control={form.control}
                  name={`room_photos.${idx}`}
                  render={() => (
                    <FormItem>
                      <Card className="border shadow-none p-0 m-0 rounded-none border-b border-x-0 border-t-0">
                        <div className="p-6 space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                              <Images className="w-5 h-5 text-primary" /> {room.category}
                            </h3>
                            <Badge variant="outline">
                              {room.photos.length} Photo{room.photos.length !== 1 && "s"}
                            </Badge>
                          </div>

                          <Dropzone
                            onFiles={(files) => handleUpload(room.category, files)}
                            note="Upload JPG, PNG, WebP"
                          />

                          {formState.errors.room_photos?.[idx]?.photos && (
                            <Alert variant="destructive">
                              <AlertDescription>
                                {formState.errors.room_photos[idx].photos?.message as string}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Photo grid */}
                          {room.photos.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {room.photos.map((photo, i) => (
                                <Card
                                  key={i}
                                  className="relative overflow-hidden group rounded-xl border p-0 shadow-sm"
                                >
                                  <Image
                                    src={photo.url}
                                    alt={photo.fileName}
                                    width={400}
                                    height={400}
                                    className="object-cover w-full h-48 sm:h-56 rounded-xl transition-all duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-2">
                                    <Button
                                      size="sm"
                                      variant={room.coverPhotoIndex === i ? "default" : "secondary"}
                                      onClick={() => setCoverPhoto(room.category, i)}
                                      className="w-full text-xs"
                                    >
                                      {room.coverPhotoIndex === i ? (
                                        <>
                                          <Star className="w-3 h-3 mr-1" /> Cover
                                        </>
                                      ) : (
                                        "Set Cover"
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => removePhoto(room.category, i)}
                                      className="w-full text-xs"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    </FormItem>
                  )}
                />
              ))
            )}
          </div>

          <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center gap-2">
            <Button variant="outline" onClick={() => setTab("Room Amenities")}>
              Back
            </Button>
            <Button
              type="button"
              disabled={uploading}
              onClick={handleNext}
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

// --------------------
// Skeleton Grid
// --------------------
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 my-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="w-full h-48 sm:h-56 rounded-xl" />
      ))}
    </div>
  );
}
