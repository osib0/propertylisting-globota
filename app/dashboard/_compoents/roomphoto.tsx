"use client";

import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Images, ArrowRight, Loader2, Trash2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useAppContext } from "@/app/contextapi";

type RoomPhoto = {
  category: string;
  photos: { fileName: string; url: string; uploading?: boolean }[];
  coverPhotoIndex: number;
};

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
      className={`relative flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-10 cursor-pointer transition-all duration-200
      ${isDragActive ? "border-primary/60 bg-primary/5 scale-[1.01]" : "hover:border-primary/40 hover:bg-muted/30"}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
          <Images className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Drag & drop</strong> your images here or{" "}
          <button
            type="button"
            onClick={open}
            className="text-primary font-medium underline-offset-2 hover:underline"
          >
            browse
          </button>
        </p>
        {note && <p className="text-xs text-muted-foreground italic">{note}</p>}
      </div>
    </div>
  );
}

interface RoomPhotosProps {
  setShareData: (value: any) => void;
  shareData: any;
}

const RoomPhotos: React.FC<RoomPhotosProps> = ({
  setShareData,
  shareData,
}) => {
  const [roomPhotos, setRoomPhotos] = useState<RoomPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setTab } = useAppContext();


  useEffect(() => {
    if (shareData?.room_detail) {
      const initialPhotos = shareData.room_detail.map((room: any) => {
        const existing = shareData.room_photos?.find(
          (r: any) => r.category === room.roomName
        );
        return (
          existing || { category: room.roomName, photos: [], coverPhotoIndex: 0 }
        );
      });
      setRoomPhotos(initialPhotos);
    }
  }, []);

  useEffect(() => {
    if (JSON.stringify(shareData?.room_photos) !== JSON.stringify(roomPhotos)) {
      setShareData((prev: any) => ({
        ...prev,
        room_photos: roomPhotos,
      }));
    }
  }, [roomPhotos]);

  const handlePhotoUpload = async (category: string, files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);

    for (const file of files) {
      const tempUrl = URL.createObjectURL(file);

      setRoomPhotos((prev) =>
        prev.map((room) =>
          room.category === category
            ? {
                ...room,
                photos: [
                  ...room.photos,
                  { fileName: file.name, url: tempUrl, uploading: true },
                ],
              }
            : room
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", `room_photos/${category}`);

        const res = await fetch("/api/photos/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const signedUrl = data.url || data.signedUrl;

        if (signedUrl) {
          setRoomPhotos((prev) =>
            prev.map((room) =>
              room.category === category
                ? {
                    ...room,
                    photos: room.photos.map((p) =>
                      p.fileName === file.name
                        ? { ...p, url: signedUrl, uploading: false }
                        : p
                    ),
                  }
                : room
            )
          );
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    setTimeout(() => setUploading(false), 500);
  };

  const removePhoto = (category: string, idx: number) => {
    setRoomPhotos((prev) =>
      prev.map((room) =>
        room.category === category
          ? { ...room, photos: room.photos.filter((_, i) => i !== idx) }
          : room
      )
    );
  };

  const setCoverPhoto = (category: string, idx: number) => {
    setRoomPhotos((prev) =>
      prev.map((room) =>
        room.category === category ? { ...room, coverPhotoIndex: idx } : room
      )
    );
  };

  function handleNext(){
    setTab('Documents')
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="border-b bg-white py-5 px-6 sticky top-0 z-20 flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">Room Photos</h2>
        <p className="text-sm text-muted-foreground">
          Upload and manage images for each room category.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {roomPhotos.map((room, idx) => (
          <Card
            key={idx}
            className="shadow-none transition-all duration-200"
          >
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Images className="w-5 h-5 text-primary" />
                  <h3 className="font-medium text-lg">{room.category}</h3>
                </div>
                <Badge variant="outline">Cover + Gallery</Badge>
              </div>

              {/* Dropzone */}
              <Dropzone
                onFiles={(files) => handlePhotoUpload(room.category, files)}
                note="Upload high-quality JPG, PNG, or WebP images."
              />

              {/* Photo Grid */}
              {room.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {room.photos.map((photo, i) => (
                    <div
                      key={i}
                      className="relative rounded-lg overflow-hidden border border-gray-200 group"
                    >
                      <Image
                        src={photo.url}
                        alt={`photo-${i}`}
                        width={1000}
                        height={1000}
                        className="object-cover w-full h-40 sm:h-48 md:h-56 transition-transform duration-300 group-hover:scale-105"
                      />

                      {photo.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 p-3">
                        <Button
                          size="sm"
                          variant={
                            room.coverPhotoIndex === i ? "default" : "secondary"
                          }
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setTab("Room Amenities")}
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={loading || uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" /> Uploading...
            </>
          ) : loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" /> Processing...
            </>
          ) : (
            <>
              Next Step <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RoomPhotos;
