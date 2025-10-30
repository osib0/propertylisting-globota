"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, PlusCircle, Info, Loader2, ArrowRight } from "lucide-react";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "../../contextapi";
import Header from "./header";

// --------------------------
// Validation Schema
// --------------------------
const roomSchema = z.object({
    roomName: z.string().min(1, "Room name is required"),
    roomType: z.string().min(1, "Room type is required"),
    numRooms: z.number().min(1),
    roomView: z.string().optional(),
    roomSizeValue: z.number().nullable(),
    roomSizeUnit: z.enum(["sqft", "sqm"]),
    numBathrooms: z.number().min(1),
    description: z.string().optional(),
});

const formSchema = z.object({
    room_detail: z.array(roomSchema),
});

type FormSchema = z.infer<typeof formSchema>;

interface RoomDetailsProps {
    setShareData: React.Dispatch<React.SetStateAction<any>>;
    shareData: any;
    defaultData: any
}

// --------------------------
// Component
// --------------------------
export default function RoomDetails({ setShareData, shareData, defaultData }: RoomDetailsProps) {
    const [roomTypes, setRoomTypes] = useState<{ label: string; value: string }[]>([]);
    const [roomViews, setRoomViews] = useState<{ label: string; value: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const { setTab } = useAppContext();



    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            room_detail:
                shareData?.room_detail || [
                    {
                        roomName: "",
                        roomType: "",
                        numRooms: 1,
                        roomView: "",
                        roomSizeValue: null,
                        roomSizeUnit: "sqft",
                        numBathrooms: 1,
                        description: "",
                    },
                ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "room_detail",
    });

    useEffect(() => {
        if (defaultData) {
            form.reset({
                room_detail: defaultData.map((room: any) => ({
                    roomName: room.roomName || "",
                    roomType: room.roomType || "",
                    numRooms: room.numRooms || 1,
                    roomView: room.roomView || "",
                    roomSizeValue: room.roomSizeValue || null,
                    roomSizeUnit: room.roomSizeUnit || "sqft",
                    numBathrooms: room.numBathrooms || 1,
                    description: room.description || "",
                })),
            });
        }
    }, [defaultData, form]);

    const rooms = form.watch("room_detail");

    // Sync data with parent
    useEffect(() => {
        setShareData((prev: any) => ({
            ...prev,
            room_detail: rooms,
        }));
    }, [rooms, setShareData]);

    // Fetch room types
    useEffect(() => {
        (async () => {
            const res = await fetch("/api/roomtype/get");
            const data = await res.json();

            // remove duplicates based on title
            const unique = Array.from(
                new Map(data?.data?.map((item: any) => [item.title, item])).values()
            );

            setRoomTypes(unique.map((item: any) => ({
                label: item.title,
                value: item.title,
            })));
        })();
    }, []);

    // Fetch room views
    useEffect(() => {
        (async () => {
            const res = await fetch("/api/roomview/get");
            const data = await res.json();
            setRoomViews(
                (data?.data || []).map((item: any) => ({ label: item.title, value: item.title }))
            );
        })();
    }, []);


    const handleNext = async () => {
        setLoading(true);
        const valid = await form.trigger();
        if (valid) {
            setTab('Sleeping Arrangement')
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col w-full min-h-screen">
            <Form {...form}>
                <form className="flex flex-col flex-1">
                    <Header title="Room Details" description="Provide rooms details" />

                    {/* Form Fields */}
                    <div className="p-6 space-y-8">
                        <div className="flex justify-end">
                            <Button type="button" variant="default" size="sm" onClick={() => append({
                                roomName: "",
                                roomType: "",
                                numRooms: 1,
                                roomView: "",
                                roomSizeValue: null,
                                roomSizeUnit: "sqft",
                                numBathrooms: 1,
                                description: "",
                            })}>
                                <PlusCircle className="w-4 h-4 mr-1" /> Add Room
                            </Button>
                        </div>
                        {fields.map((field, index) => (
                            <Card key={field.id} className="border rounded-xl shadow-sm max-w-4xl mx-auto">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        Room {index + 1}
                                    </CardTitle>
                                    {fields.length > 1 && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </Button>
                                    )}
                                </CardHeader>

                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Room Name */}
                                    <FormField
                                        control={form.control}
                                        name={`room_detail.${index}.roomName`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Room Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Deluxe Sea View Room" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Room Type */}
                                    <FormField
                                        control={form.control}
                                        name={`room_detail.${index}.roomType`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Room Type</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {roomTypes.map((t, idx) => (
                                                            <SelectItem key={`${t.value}-${idx}`} value={t.value}>
                                                                {t.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Room View */}
                                    <FormField
                                        control={form.control}
                                        name={`room_detail.${index}.roomView`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Room View</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select view" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {roomViews.map((v, idx) => (
                                                            <SelectItem key={`${v.value}-${idx}`} value={v.value}>
                                                                {v.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Room Size */}
                                    <FormField
                                        control={form.control}
                                        name={`room_detail.${index}.roomSizeValue`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Room Size</FormLabel>
                                                <div className="flex gap-3 items-center">
                                                    <Input
                                                        type="number"
                                                        placeholder="Ex: 250"
                                                        className="w-32"
                                                        value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`room_detail.${index}.roomSizeUnit`}
                                                        render={({ field }) => (
                                                            <div className="flex gap-3">
                                                                <label className="flex items-center gap-1 text-sm">
                                                                    <input
                                                                        type="radio"
                                                                        value="sqft"
                                                                        checked={field.value === "sqft"}
                                                                        onChange={() => field.onChange("sqft")}
                                                                    />
                                                                    Sq Ft
                                                                </label>
                                                                <label className="flex items-center gap-1 text-sm">
                                                                    <input
                                                                        type="radio"
                                                                        value="sqm"
                                                                        checked={field.value === "sqm"}
                                                                        onChange={() => field.onChange("sqm")}
                                                                    />
                                                                    Sq M
                                                                </label>
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Number of Rooms */}
                                    <FormField
                                        control={form.control}
                                        name={`room_detail.${index}.numRooms`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Rooms</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Bathrooms */}
                                    <FormField
                                        control={form.control}
                                        name={`room_detail.${index}.numBathrooms`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Bathrooms</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Description */}
                                    <FormField
                                        control={form.control}
                                        name={`room_detail.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe the room in detail"
                                                        rows={3}
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>

                                {index < fields.length - 1 && (
                                    <CardFooter>
                                        <Separator className="my-2" />
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                </form>
            </Form>
            <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => setTab('Property Photos')} >
                    Back
                </Button>
                <Button onClick={handleNext} disabled={loading} className="flex items-center gap-2">
                    {loading ? (
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
}
