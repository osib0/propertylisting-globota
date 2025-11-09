"use client";

import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2,
    FileText,
    UploadCloud,
    NotebookText,
    ArrowRight,
    Info,
    Eye,
    Trash2,
} from "lucide-react";
import { useAppContext } from "@/app/contextapi";
import Header from "./header";

// ---------- Types ----------
type UploadedFile = { fileName: string; url: string };
type DocumentsData = {
    docGST?: UploadedFile;
    docPan?: UploadedFile;
    docAadhar?: UploadedFile;
    docPropertyDeed?: UploadedFile;
    docFireSafety?: UploadedFile;
    docNoc?: UploadedFile;
    docOther?: UploadedFile;
    docNotes?: string;
};

interface DocumentsProps {
    shareData: any;
    setShareData: (value: any) => void;
    loading?: boolean;
    defaultData?: any;
}

// ---------- Validation Schema ----------
const UploadedFileSchema = z.object({
    fileName: z.string(),
    url: z.string(),
});

const DocumentsSchema = z.object({
    docGST: UploadedFileSchema,
    docPan: UploadedFileSchema,
    docAadhar: UploadedFileSchema,
    docPropertyDeed: UploadedFileSchema,
    docFireSafety: UploadedFileSchema,
    docNoc: UploadedFileSchema,
    docOther: UploadedFileSchema.optional(),
    docNotes: z.string().optional(),
});

// ---------- Upload to S3 ----------
const handleDocumentUpload = async (files: File[], folder: string) => {
    const uploadedFiles: UploadedFile[] = [];
    for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/photos/upload", { method: "POST", body: formData });
        const data = await res.json();
        const signedUrl = data.url || data.signedUrl;
        if (signedUrl) uploadedFiles.push({ fileName: file.name, url: signedUrl });
    }
    return uploadedFiles;
};

// ---------- Dropzone ----------
const Dropzone = ({
    onFiles,
    note,
    accept,
    preview,
    onRemove,
}: {
    onFiles: (files: File[]) => void;
    note?: string;
    accept?: any;
    preview?: string | null;
    onRemove?: () => void;
}) => {
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop: (acc) => onFiles(acc),
        accept,
        multiple: false,
        noClick: true,
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${isDragActive
                ? "border-primary bg-primary/5 shadow-inner"
                : "border-muted hover:border-primary/40 hover:bg-muted/30"
                }`}
        >
            <input {...getInputProps()} />
            {preview ? (
                <div className="flex flex-col items-center space-y-3">
                    {preview.endsWith(".pdf") ? (
                        <div className="flex flex-col items-center space-y-2">
                            <FileText className="w-10 h-10 text-red-500" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {note}
                            </p>
                        </div>
                    ) : (
                        <img
                            src={preview}
                            alt={note}
                            className="w-28 h-28 object-cover rounded-md border shadow-sm"
                        />
                    )}

                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={open}>
                            Change
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onRemove}
                            className="flex items-center gap-1"
                        >
                            <Trash2 className="w-4 h-4" /> Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-2">
                    <UploadCloud className="w-8 h-8 text-primary" />
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Drag & drop</strong> or{" "}
                        <button
                            type="button"
                            onClick={open}
                            className="text-primary font-medium underline-offset-2 hover:underline"
                        >
                            browse
                        </button>{" "}
                        files
                    </p>
                    {note && (
                        <p className="text-xs text-muted-foreground italic">
                            {note === "No file chosen" ? "No file selected yet" : note}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// ---------- Main Component ----------
const Documents: React.FC<DocumentsProps> = ({
    shareData,
    setShareData,
    defaultData,
}) => {
    const { setTab } = useAppContext();
    const [uploading, setUploading] = useState(false);
    const [docs, setDocs] = useState<DocumentsData>({});

    const form = useForm<z.infer<typeof DocumentsSchema>>({
        resolver: zodResolver(DocumentsSchema),
        mode: "onChange",
        defaultValues: {
            docGST: undefined,
            docPan: undefined,
            docAadhar: undefined,
            docPropertyDeed: undefined,
            docFireSafety: undefined,
            docNoc: undefined,
            docOther: undefined,
            docNotes: "",
            ...(defaultData || {}),
        },
    });


    const {
        setValue,
        watch,
    } = form;

    useEffect(() => {
        if (shareData?.documents) setDocs(shareData.documents);
        else if (defaultData) setDocs(defaultData);
    }, [shareData, defaultData]);

    // Handle Upload
    const handleFiles = async (files: File[], key: keyof DocumentsData) => {
        if (!files.length) return;
        setUploading(true);
        const uploaded = await handleDocumentUpload(files, key);
        if (uploaded.length > 0) {
            const fileObj = uploaded[0];
            const updatedDocs = { ...docs, [key]: fileObj };
            setDocs(updatedDocs);
            setShareData((prev: any) => ({ ...prev, documents: updatedDocs }));
            setValue(key, fileObj, { shouldValidate: true });
            await form.trigger();
        }
        setUploading(false);
    };

    const removeFile = async (key: keyof DocumentsData) => {
        const updatedDocs = { ...docs, [key]: undefined };
        setDocs(updatedDocs);
        setShareData((prev: any) => ({ ...prev, documents: updatedDocs }));
        setValue(key, undefined, { shouldValidate: true });
        await form.trigger();
    };



    const handleNotesChange = (value: string) => {
        const updatedDocs = { ...docs, docNotes: value };
        setDocs(updatedDocs);
        setShareData((prev: any) => ({ ...prev, documents: updatedDocs }));
        setValue("docNotes", value, { shouldValidate: true });
    };

    const fileName = (key: keyof DocumentsData) => {
        const value = docs[key];
        if (typeof value === "object" && value !== null && "fileName" in value) {
            return value.fileName;
        }
        return "No file chosen";
    };


    const NextHandler = async () => {
        const isValid = await form.trigger();
        if (isValid) {
            setTab("Owner Details")
        }
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-muted/20">
            <Header
                status={form.formState.isValid}
                title="Documents"
                description="Upload necessary verification documents (PDF or Images)"
            />

            {/* Summary */}
            <div className="px-6 py-3 mt-3 mb-4 flex flex-wrap justify-between items-center max-w-4xl mx-auto w-full text-sm text-gray-700 rounded-xl bg-white">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="font-medium">Total Required Documents: 6</span>
                </div>
                <span>
                    Uploaded:{" "}
                    {
                        Object.values(watch()).filter(
                            (val) => typeof val === "object" && val !== null
                        ).length
                    }{" "}
                    / 6
                </span>
            </div>

            {/* Form */}
            <Card className="shadow-none border border-muted/40 px-2 max-w-4xl mx-auto rounded-xl bg-white">
                <h1 className="text-xl font-semibold px-6 pt-4 pb-2">Upload Your Documents</h1>
                <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {[
                        { label: "GST Certificate", key: "docGST" },
                        { label: "PAN Card", key: "docPan" },
                        { label: "Aadhar Card", key: "docAadhar" },
                        { label: "Property Deed / Agreement", key: "docPropertyDeed" },
                        { label: "Fire Safety / Compliance", key: "docFireSafety" },
                        { label: "NOC (Local Authority / Society)", key: "docNoc" },
                        { label: "Other Document (Optional)", key: "docOther" },
                    ].map((item) => {
                        const doc = docs[item.key as keyof DocumentsData] as UploadedFile | undefined;
                        return (
                            <div
                                key={item.key}
                                className="rounded-xl border border-muted/50 bg-muted/10 hover:bg-muted/20 transition-all duration-150 p-4 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary/80" />
                                        <h3 className="text-sm font-medium text-foreground">
                                            {item.label}
                                        </h3>
                                    </div>
                                    {doc ? (
                                        <Badge
                                            variant="outline"
                                            className="text-green-600 border-green-200 bg-transparent"
                                        >
                                            Uploaded
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Pending</Badge>
                                    )}
                                </div>

                                <Dropzone
                                    onFiles={(f) => handleFiles(f, item.key as keyof DocumentsData)}
                                    note={fileName(item.key as keyof DocumentsData)}
                                    preview={doc?.url || null}
                                    onRemove={() => removeFile(item.key as keyof DocumentsData)}
                                    accept={{
                                        "application/pdf": [".pdf"],
                                        "image/jpeg": [".jpg", ".jpeg"],
                                        "image/png": [".png"],
                                        "image/webp": [".webp"],
                                    }}

                                />
                            </div>
                        );
                    })}

                    {/* Notes */}
                    <div className="col-span-1 sm:col-span-2 space-y-2 border border-muted/40 bg-muted/10 rounded-xl p-5">
                        <label className="text-sm font-medium flex items-center gap-1 text-foreground">
                            <NotebookText className="w-4 h-4 text-primary/80" />
                            Additional Notes
                        </label>
                        <Textarea
                            rows={3}
                            placeholder="Any extra details for verification team..."
                            value={docs.docNotes || ""}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            className="resize-none bg-white focus-visible:ring-1 focus-visible:ring-primary/60"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center gap-2">
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setTab("Room Photos")}
                >
                    Back
                </Button>
                <Button
                    onClick={NextHandler}
                    disabled={!form.formState.isValid}
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
        </div>
    );
};

export default Documents;
