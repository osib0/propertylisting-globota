"use client";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
    DndContext,
    closestCenter,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
// import PhotoEditModel from "./PhotoEditModel";
import { MoreVertical, Image as ImageIcon, CloudUpload, RefreshCw } from "lucide-react";
import { useAppContext } from "@/app/contextapi";

/* ===================== Types ===================== */
type Photo = {
    _id: string;
    photo_name: string;
    photo_sort_id: number;
    photo_tag?: string[];
};

type UploadStatus = "pending" | "uploading" | "done" | "error";
type UploadProgressItem = { name: string; percent: number; status: UploadStatus };
type UploadMap = { [uploadId: string]: UploadProgressItem };

/* ============= Sortable Photo Card ============== */
const SortablePhoto = ({
    photo,
    propertyId,
    onClick,
}: {
    photo: Photo;
    propertyId: string;
    onClick: () => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: photo._id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        position: "relative",
    };

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="relative">
            {photo.photo_tag?.length ? (
                <div className="absolute top-1 left-1 z-20 flex flex-wrap gap-1 max-w-[109px]">
                    {photo.photo_tag.slice(0, 3).map((tag, i) => (
                        <span
                            key={i}
                            className="text-[10px] bg-blue-600 text-white rounded px-1 py-0.5 truncate"
                            title={tag}
                        >
                            {tag}
                        </span>
                    ))}
                    {photo.photo_tag.length > 3 && (
                        <span
                            className="text-[10px] bg-gray-600 text-white rounded px-1 py-0.5"
                            title={photo.photo_tag.slice(3).join(", ")}
                        >
                            +{photo.photo_tag.length - 3} more
                        </span>
                    )}
                </div>
            ) : null}

            <button
                onClick={onClick}
                type="button"
                className="block w-[150px] h-[150px] rounded overflow-hidden"
            >
                <img
                    src={photo.photo_name}
                    alt={`https://royalrajasthantravel.s3.ap-south-1.amazonaws.com/public/${propertyId}/propertyPhotos/${photo.photo_name}`}
                    width={150}
                    height={150}
                    className="object-cover w-full h-full"
                />
            </button>
        </div>
    );
};

/* ============== Main Component ================== */
const PropertyPhotos = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [show, setShow] = useState(false);
    const [photoId, setPhotoId] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState<UploadMap>({});

    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    const { propertyId, userId } = useAppContext()
    /* -------- fetch & normalize -------- */
    const fetchPhotos = useCallback(async () => {
        if (!propertyId || !userId) return;
        setLoading(true);

        try {
            const pendingRes = await fetch(
                `/api/history/info/pending?propertyId=${propertyId}&userId=${userId}&section=photos`
            );
            const pendingData = await pendingRes.json();

            if (pendingData?.status && pendingData.data) {
                const changesArray = Array.isArray(pendingData.data)
                    ? pendingData.data.flatMap((item: any) => item.changes || [])
                    : pendingData.data.changes || [];

                if (changesArray.length > 0) {
                    toast("You have a pending photo edit request (awaiting admin approval)");

                    // setPhotos(
                    //     changesArray.map((c: any) => ({
                    //         _id: crypto.randomUUID(),
                    //         photo_name: c.newValue?.filename || "",
                    //         photo_sort_id: c.newValue?.sortOrder || 0,
                    //         photo_tag: [],
                    //     }))
                    // );

                    setLoading(false);
                    return;
                }
            }

            const res = await fetch(`/api/propertyphotos/get/${propertyId}`, { cache: "no-store" });
            const data = await res.json();

            if (!res.ok) throw new Error("Failed to fetch photos");

            const list: Photo[] = Array.isArray(data?.data) ? data.data : [];
            list.sort((a, b) => a.photo_sort_id - b.photo_sort_id);
            setPhotos(list);
        } catch (e) {
            console.error("Photo fetch error:", e);
            toast.error("Failed to load photos");
        } finally {
            setLoading(false);
        }
    }, [propertyId, userId]);

    useEffect(() => {
        if (propertyId && userId) fetchPhotos();
    }, [propertyId, userId]);


    /* -------- helpers: progress state -------- */
    const setProgress = useCallback((uploadId: string, patch: Partial<UploadProgressItem>) => {
        setUploadProgress((prev) => {
            const cur: UploadProgressItem = prev[uploadId] || {
                name: uploadId,
                percent: 0,
                status: "pending",
            };
            return { ...prev, [uploadId]: { ...cur, ...patch } };
        });
    }, []);

    const clearAllProgressSoon = useCallback(() => {
        setTimeout(() => setUploadProgress({}), 1200);
    }, []);

    /* -------- upload with XHR & onprogress -------- */
    function uploadFileToS3(file: File, url: string, uploadId: string) {
        return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            setProgress(uploadId, { status: "uploading" });

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setProgress(uploadId, { percent });
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    setProgress(uploadId, { percent: 100, status: "done" });
                    resolve();
                } else {
                    setProgress(uploadId, { status: "error" });
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            };
            xhr.onerror = () => {
                setProgress(uploadId, { status: "error" });
                reject(new Error("Upload error"));
            };

            xhr.open("PUT", url);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
        });
    }

    /* -------- dropzone (multi-file, per-file bars) -------- */
    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (!acceptedFiles?.length) return;

            try {
                const existingCount = photos.length;

                const oldPhotos = photos.map((p) => ({
                    filename: p.photo_name,
                    sortOrder: p.photo_sort_id,
                }));

                for (let i = 0; i < acceptedFiles.length; i++) {
                    const file = acceptedFiles[i];

                    if (file.size > 20 * 1024 * 1024) {
                        toast.error(`"${file.name}" exceeds 20MB`);
                        continue;
                    }

                    const rand = Math.floor(Math.random() * 10000);
                    const ts = Date.now();
                    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
                    const filename = `${ts}-${rand}.${ext}`;
                    const uploadId = filename;

                    setProgress(uploadId, { name: file.name, percent: 0, status: "pending" });

                    const presRes = await fetch("/api/propertyphotos/s3-presigned-url", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            propertyId,
                            fileName: filename,
                            contentType: file.type,
                        }),
                    });

                    if (!presRes.ok) {
                        setProgress(uploadId, { status: "error" });
                        toast.error(`Failed to get upload URL for ${file.name}`);
                        continue;
                    }

                    const { url } = await presRes.json();

                    // 🔹 Step 2: Upload to S3
                    await uploadFileToS3(file, url, uploadId);

                    const fileUrl = `https://royalrajasthantravel.s3.ap-south-1.amazonaws.com/public/${propertyId}/propertyPhotos/${filename}`;

                    setPhotos((prev) => [
                        ...prev,
                        {
                            _id: crypto.randomUUID(),
                            photo_name: fileUrl,
                            photo_sort_id: existingCount + i + 1,
                            photo_tag: [],
                        },
                    ]);

                    const historyRes = await fetch("/api/history/info/add", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            propertyId,
                            userId,
                            section: "photos",
                            changes: [
                                {
                                    field: "photo_gallery",
                                    oldValue: null,
                                    newValue: {
                                        filename: fileUrl,
                                        sortOrder: existingCount + i + 1,
                                    },
                                },
                            ],
                        }),
                    });


                    const historyJson = await historyRes.json();
                    if (historyJson.status) {
                        toast.success("Photo upload request submitted for approval");
                    } else {
                        toast.error(historyJson.message || "Failed to log photo change");
                    }
                }

                clearAllProgressSoon();
            } catch (e) {
                console.error("Upload error:", e);
                toast.error("Upload error");
            }
        },
        [propertyId, userId, photos, setProgress, clearAllProgressSoon]
    );


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "image/jpg": [],
            "image/gif": [],
            "image/webp": [],
            "image/svg+xml": [],
        },
        maxFiles: 10,
        multiple: true,
        maxSize: 20 * 1024 * 1024,
    });

    /* -------- DnD handlers -------- */
    const handleDragStart = useCallback((e: DragStartEvent) => {
        setActiveId(String(e.active.id));
    }, []);

    const handleDragEnd = useCallback(
        (e: DragEndEvent) => {
            const { active, over } = e;
            if (!over || active.id === over.id) return;

            const ids = photos.map((p) => p._id);
            const oldIndex = ids.indexOf(String(active.id));
            const newIndex = ids.indexOf(String(over.id));
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove(photos, oldIndex, newIndex).map((p, idx) => ({
                ...p,
                photo_sort_id: idx + 1,
            }));

            setPhotos(reordered);
            setActiveId(null);

            // persist order
            (async () => {
                try {
                    const res = await fetch("/api/propertyphotos/update", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            property_id: propertyId,
                            photos: reordered.map((p) => ({ _id: p._id, photo_sort_id: p.photo_sort_id })),
                        }),
                    });
                    const j = await res.json();
                    if (!j?.success) toast.error("Failed to update sort order");
                    else toast.success("Order updated");
                } catch (err) {
                    console.error("Sort order update error:", err);
                    toast.error("Error updating sort order");
                }
            })();
        },
        [photos, propertyId]
    );

    /* -------- Delete -------- */
    const handleDelete = useCallback(
        async (id: string) => {
            try {
                const res = await fetch("/api/propertyphotos/delete", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ photoId: id }),
                });
                const j = await res.json();
                if (j?.success) {
                    toast.success("Photo deleted");
                    await fetchPhotos();
                } else toast.error("Failed to delete photo");
            } catch (e) {
                console.error("Delete error:", e);
                toast.error("Error deleting photo");
            }
        },
        [fetchPhotos]
    );

    /* -------- Edit -------- */
    function editHandler(id: string) {
        setShow(true);
        setPhotoId(id);
    }

    /* ---------------- Render ---------------- */
    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveId(null)}
            >
                <div className="p-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium">Property Photos</h3>
                        <button
                            type="button"
                            onClick={fetchPhotos}
                            aria-label="Refresh photos"
                            className="p-1 rounded hover:bg-gray-100"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground">Upload high-quality property images. Drag to reorder.</p>

                    <div className="mt-4 border rounded p-4 bg-white">
                        {loading ? (
                            <div className="flex flex-wrap gap-3 mb-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="w-[150px] h-[150px]" />
                                ))}
                            </div>
                        ) : photos.length ? (
                            <div className="flex flex-wrap gap-3 mb-4">
                                <SortableContext items={photos.map((p) => p._id)} strategy={rectSortingStrategy}>
                                    {photos.map((photo) => (
                                        <div key={photo._id} className="relative">
                                            <SortablePhoto
                                                photo={photo}
                                                propertyId={propertyId || ''}
                                                onClick={() => {
                                                    setShow(true);
                                                    setPhotoId(photo._id);
                                                }}
                                            />

                                            <div className="absolute top-1 right-1 z-30">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            className="p-1 bg-white/80 rounded-full shadow-sm hover:bg-white"
                                                            aria-label="photo options"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[140px]">
                                                        <DropdownMenuItem onClick={() => handleDelete(photo._id)}>Delete</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => editHandler(photo._id)}>Edit</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </SortableContext>
                            </div>
                        ) : (
                            <div className="text-center text-sm text-muted-foreground mb-4">
                                <ImageIcon size={36} className="mx-auto mb-2" />
                                <p className="m-0">No photos uploaded yet</p>
                            </div>
                        )}

                        {/* Dropzone */}
                        <div className="flex justify-center">
                            <div
                                {...getRootProps()}
                                className={`w-full max-w-[720px] p-6 rounded text-center border-2 border-dashed ${isDragActive ? "border-green-500" : "border-slate-200"
                                    } bg-white cursor-pointer`}
                            >
                                <input {...getInputProps()} />
                                <CloudUpload size={40} className="mx-auto mb-2" />
                                <p className="text-sm font-medium mb-1">{isDragActive ? "Drop files here..." : "Browse or drop files to upload"}</p>
                                <p className="text-xs text-muted-foreground">Supported: JPG, JPEG, PNG, GIF, WEBP, SVG (max 20MB each)</p>

                                {/* Per-file progress */}
                                {Object.keys(uploadProgress).length > 0 && (
                                    <div className="mt-4 text-left max-w-[680px] mx-auto">
                                        {Object.entries(uploadProgress).map(([id, item]) => (
                                            <div key={id} className="mb-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm truncate" style={{ maxWidth: 480 }} title={item.name}>
                                                        {item.name}
                                                    </span>
                                                    <span className="text-xs">
                                                        {item.status === "error" ? "Failed" : `${item.percent}%`}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded h-2 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100}>
                                                    <div
                                                        className={`h-full ${item.status === "error" ? "bg-red-600" : "bg-blue-600"}`}
                                                        style={{ width: `${item.percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DragOverlay adjustScale style={{ transformOrigin: "0 0" }}>
                    {activeId
                        ? (() => {
                            const found = photos.find((p) => p._id === activeId);
                            return found ? (
                                <div className="w-[100px] h-[100px] rounded overflow-hidden shadow">
                                    <Image
                                        src={`${found.photo_name}`}
                                        alt="Dragged photo"
                                        width={100}
                                        height={100}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            ) : null;
                        })()
                        : null}
                </DragOverlay>
            </DndContext>

            {/* {photoId && (
        <PhotoEditModel
          show={show}
          setShow={setShow}
          fetchPhotos={fetchPhotos}
          photos={photos}
          ClickHandler={photoId}
        />
      )} */}
        </>
    );
};

export default PropertyPhotos;
