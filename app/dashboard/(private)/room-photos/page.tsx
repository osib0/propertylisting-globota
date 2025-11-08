"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
    DndContext,
    closestCenter,
    MouseSensor,
    TouchSensor,
    DragOverlay,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDropzone } from "react-dropzone";

// shadcn UI components (adjust paths if your project aliases differ)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Image as ImageIcon, UploadCloud, RefreshCw, MoreVertical, Trash } from "lucide-react";

import toast from "react-hot-toast";
import { useAppContext } from "@/app/contextapi";

/** ======================
 *      Types
 *  ====================== */
type Photo = {
    _id: string;
    photo_name: string;
    photo_sort_id: number;
};

type Room = {
    _id: string;
    room_name: string;
    photos: Photo[];
};

type UploadStatus = "pending" | "uploading" | "done" | "error";

type UploadProgressItem = {
    name: string;
    percent: number;
    status: UploadStatus;
};

type UploadProgressState = {
    [roomId: string]: {
        [uploadId: string]: UploadProgressItem;
    };
};

/** ======================
 *  Sortable Photo Item
 *  ====================== */
const SortablePhoto = ({ photo, propertyId, roomId }: { photo: Photo; propertyId: string; roomId: string }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo._id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        cursor: "grab",
    };

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} className="rounded overflow-hidden" style={style}>
            <Image
                src={`${photo.photo_name}`}
                alt={photo.photo_name}
                width={160}
                height={120}
                className="object-cover w-40 h-[120px] rounded"
            />
        </div>
    );
};

/** ======================
 *      Main Component
 *  ====================== */
export default function Page() {
    const [roomlist, setRoomList] = useState<Room[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({});

    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
    const { propertyId } = useAppContext()

    /** ------- helpers ------- */
    const setProgress = useCallback((roomId: string, uploadId: string, patch: Partial<UploadProgressItem>) => {
        setUploadProgress((prev) => {
            const room = prev[roomId] || {};
            const current: UploadProgressItem = room[uploadId] || { name: uploadId, percent: 0, status: "pending" };
            return {
                ...prev,
                [roomId]: {
                    ...room,
                    [uploadId]: { ...current, ...patch },
                },
            };
        });
    }, []);

    const clearRoomProgress = useCallback((roomId: string) => {
        setUploadProgress((prev) => {
            const updated = { ...prev };
            delete updated[roomId];
            return updated;
        });
    }, []);

    const removeOneProgress = useCallback((roomId: string, uploadId: string) => {
        setUploadProgress((prev) => {
            const room = { ...(prev[roomId] || {}) };
            delete room[uploadId];
            const updated = { ...prev };
            if (Object.keys(room).length === 0) delete updated[roomId];
            else updated[roomId] = room;
            return updated;
        });
    }, []);

    /** ------- API calls ------- */
    async function refreshHandler() {
        setLoading(true);
        try {
            const res = await fetch(`/api/roomfileswithphotos/get/${propertyId}`, { cache: "no-store" });
            const data = await res.json();
            const list: Room[] = Array.isArray(data?.data) ? data.data : [];
            list.forEach((room) => {
                room.photos = (room.photos || []).slice().sort((a, b) => a.photo_sort_id - b.photo_sort_id);
            });
            setRoomList(list);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load rooms");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId]);

    async function fetchRoomPhotoCount(roomId: string): Promise<number> {
        try {
            const res = await fetch(`/api/roomfileswithphotos/get?id=${roomId}`, { cache: "no-store" });
            const data = await res.json();
            if (data?.success) return data?.data?.photos?.length || 0;
        } catch (e) {
            console.error("Fetch count error:", e);
        }
        return 0;
    }

    async function updatePhotoSortOrderToBackend(roomId: string, photos: Photo[]) {
        try {
            const response = await fetch("/api/roomfiles/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, photos: photos.map((p) => ({ _id: p._id, photo_sort_id: p.photo_sort_id })) }),
            });
            const result = await response.json();
            if (!result?.success) console.error("Backend update failed:", result?.error);
        } catch (err) {
            console.error("Failed to update photo sort order:", err);
        }
    }

    /** ------- Upload with per-file progress ------- */
    function uploadFileWithProgress(file: File, presignedUrl: string, roomId: string, uploadId: string) {
        return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            setProgress(roomId, uploadId, { status: "uploading" });

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setProgress(roomId, uploadId, { percent });
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    setProgress(roomId, uploadId, { percent: 100, status: "done" });
                    resolve();
                } else {
                    setProgress(roomId, uploadId, { status: "error" });
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                setProgress(roomId, uploadId, { status: "error" });
                reject(new Error("Upload error"));
            };

            xhr.open("PUT", presignedUrl);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
        });
    }

    /** ------- Dropzone (per room) ------- */
    const RoomDropzone = ({ roomId }: { roomId: string }) => {
        const onDrop = useCallback(
            async (acceptedFiles: File[]) => {
                if (!acceptedFiles?.length) return;

                const existingCount = await fetchRoomPhotoCount(roomId);

                try {
                    for (let i = 0; i < acceptedFiles.length; i++) {
                        const file = acceptedFiles[i];
                        const randomNum = Math.floor(Math.random() * 10000);
                        const timestamp = Date.now();
                        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
                        const filename = `${timestamp}-${randomNum}.${ext}`;
                        const uploadId = filename;
                        setProgress(roomId, uploadId, { name: file.name, percent: 0, status: "pending" });

                        const presRes = await fetch("/api/roomfiles/s3-presigned-url", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ propertyId, fileName: filename, roomId, contentType: file.type }),
                        });

                        if (!presRes.ok) {
                            setProgress(roomId, uploadId, { status: "error" });
                            toast.error(`Failed to get upload URL for ${file.name}`);
                            continue;
                        }

                        const { url } = await presRes.json();
                        await uploadFileWithProgress(file, url, roomId, uploadId);

                        const photo_sort_id = existingCount + i + 1;
                        const formData = new FormData();
                        formData.append("filename", filename);
                        formData.append("property_id", propertyId ?? '');
                        formData.append("roomId", roomId);
                        formData.append("photo_sort_id", String(photo_sort_id));

                        const resData = await fetch("/api/roomfiles/add", { method: "POST", body: formData });
                        const result = await resData.json();
                        if (!result?.success) {
                            setProgress(roomId, uploadId, { status: "error" });
                            toast.error(`DB save failed for ${file.name}`);
                        }
                    }

                    await refreshHandler();
                    toast.success("Upload complete");

                    setTimeout(() => clearRoomProgress(roomId), 1200);
                } catch (err) {
                    console.error(err);
                    toast.error("Upload error");
                }
            },
            [propertyId, roomId]
        );

        const onDropRejected = (fileRejections: any[]) => {
            fileRejections.forEach((rej: any) => {
                rej.errors.forEach((err: any) => {
                    if (err.code === "file-too-large") toast.error(`File ${rej.file.name} is larger than 20MB limit.`);
                    else if (err.code === "file-invalid-type") toast.error(`File ${rej.file.name} has unsupported format.`);
                    else toast.error(err.message);
                });
            });
        };

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop,
            onDropRejected,
            accept: {
                "image/jpeg": [],
                "image/png": [],
                "image/jpg": [],
                "image/gif": [],
                "image/svg+xml": [],
                "image/webp": [],
            },
            maxFiles: 10,
            maxSize: 20 * 1024 * 1024,
            multiple: true,
        });

        const roomUploads = uploadProgress[roomId] || {};

        return (
            <div className="mt-4">
                <div
                    {...getRootProps()}
                    className={`w-full rounded border-2 border-dashed p-4 text-center ${isDragActive ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                        <UploadCloud className="w-8 h-8" />
                        <p className="text-sm font-medium text-slate-600">Browse or drop files to upload</p>
                        <p className="text-xs text-slate-400">Supported: JPG, JPEG, PNG, GIF, SVG, WEBP (max 20MB each)</p>
                    </div>

                    {Object.keys(roomUploads).length > 0 && (
                        <div className="mt-3 max-w-2xl mx-auto text-left">
                            {Object.entries(roomUploads).map(([uploadId, item]) => (
                                <div key={uploadId} className="mb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="truncate max-w-[60%] text-sm" title={item.name}>
                                            {item.name}
                                        </span>
                                        <span className="text-sm">{item.status === "error" ? "Failed" : `${item.percent}%`}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded overflow-hidden">
                                        <div className={`h-2 ${item.status === "error" ? "bg-red-600" : "bg-emerald-600"}`} style={{ width: `${item.percent}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    /** ------- DnD handlers ------- */
    const handleDragStart = useCallback((event: DragStartEvent) => setActiveId(String(event.active.id)), []);

    const toastDisplayedRef = useRef(false);
    function onceToast(message: string) {
        if (!toastDisplayedRef.current) {
            toastDisplayedRef.current = true;
            toast.success(message);
            setTimeout(() => (toastDisplayedRef.current = false), 2000);
        }
    }

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setRoomList((rooms) =>
            rooms.map((room) => {
                const sorted = room.photos.slice().sort((a, b) => a.photo_sort_id - b.photo_sort_id);
                const ids = sorted.map((p) => p._id);
                if (!ids.includes(String(active.id)) || !ids.includes(String(over.id))) return room;

                const oldIndex = ids.indexOf(String(active.id));
                const newIndex = ids.indexOf(String(over.id));

                const reordered = arrayMove(sorted, oldIndex, newIndex).map((p, idx) => ({ ...p, photo_sort_id: idx + 1 }));

                updatePhotoSortOrderToBackend(room._id, reordered);

                return { ...room, photos: reordered };
            })
        );

        setActiveId(null);
        onceToast("Saved changes");
    }, []);

    const handleDragCancel = useCallback(() => setActiveId(null), []);

    /** ------- Delete photo ------- */
    async function photoDeleteHandler(photoId: string, roomId: string) {
        try {
            const res = await fetch("/api/roomfiles/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ photoId }),
            });
            const result = await res.json();

            if (result?.success) {
                toast.success("Photo deleted");
                setRoomList((rooms) =>
                    rooms.map((room) => {
                        if (room._id !== roomId) return room;
                        const remaining = room.photos.filter((p) => p._id !== photoId);
                        const reindexed = remaining.map((p, i) => ({ ...p, photo_sort_id: i + 1 }));
                        updatePhotoSortOrderToBackend(roomId, reindexed);
                        return { ...room, photos: reindexed };
                    })
                );
            } else {
                toast.error("Failed to delete photo");
            }
        } catch (e) {
            console.error("Delete error:", e);
            toast.error("Error deleting photo");
        }
    }

    /** ------- Render ------- */
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="p-4 bg-white mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="text-lg font-semibold">Photos</h3>
                        <p className="text-sm text-slate-500">Upload high-quality photos for each room. Drag to reorder; changes auto-save.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={refreshHandler} className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </Button>
                    </div>
                </div>
                <div className="grid gap-4">
                    {roomlist.map((room) => {
                        const sorted = room.photos.slice().sort((a, b) => a.photo_sort_id - b.photo_sort_id);

                        return (
                            <Card key={room._id} className="p-4">
                                <CardHeader className="flex items-center justify-between p-0 mb-3">
                                    {loading ? <Skeleton className="h-6 w-48" /> : <CardTitle className="text-base">{room.room_name}</CardTitle>}
                                </CardHeader>

                                {!loading ? (
                                    sorted.length > 0 ? (
                                        <div className="flex flex-wrap gap-3 mb-3">
                                            <SortableContext items={sorted.map((p) => p._id)} strategy={rectSortingStrategy}>
                                                {sorted.map((photo) => (
                                                    <div key={photo._id} className="relative">
                                                        <SortablePhoto photo={photo} propertyId={propertyId ?? ''} roomId={room._id} />

                                                        <div className="absolute top-1 right-1">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="sm" variant="ghost" className="p-1 rounded-full">
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => photoDeleteHandler(photo._id, room._id)}>
                                                                        <Trash className="w-4 h-4 mr-2 inline-block" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                ))}
                                            </SortableContext>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-500 mb-3">
                                            <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                                            <p className="text-sm">No photos uploaded yet</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {Array.from({ length: 6 }).map((_, idx) => (
                                            <Skeleton key={idx} className="h-28 w-40" />
                                        ))}
                                    </div>
                                )}

                                <CardContent className="p-0">
                                    <RoomDropzone roomId={room._id} />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <DragOverlay adjustScale style={{ transformOrigin: "0 0" }}>
                    {activeId
                        ? (() => {
                            const found = roomlist
                                .flatMap((room) => room.photos.map((p) => ({ ...p, roomId: room._id })))
                                .find((p) => p._id === activeId);
                            return found ? (
                                <Image
                                    src={`${found.photo_name}`}
                                    alt="Dragged photo"
                                    width={120}
                                    height={90}
                                    className="rounded object-cover"
                                />
                            ) : null;
                        })()
                        : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
