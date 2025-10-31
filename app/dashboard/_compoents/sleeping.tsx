"use client";

import React, { useEffect, useMemo } from "react";
import { Bed, Minus, Plus, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "../../contextapi";
import Header from "./header";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

/* ---------------------
   Zod Schemas
   --------------------- */
const BedTypeSchema = z.object({
    type: z.string().min(1, "Please select a bed type"),
    count: z
        .number()
        .min(1, "At least 1 bed required"),
});

const OccupancySchema = z
    .object({
        baseAdults: z
            .number()
            .min(1, "Base adults must be at least 1"),
        maxAdults: z
            .number()
            .min(1, "Max adults must be at least 1"),
        maxChildren: z
            .number()
            .min(0, "Max children cannot be negative"),
        maxOccupancy: z
            .number()
            .min(1, "Max occupancy must be at least 1"),
    })
    .superRefine((occ, ctx) => {
        if (occ.maxAdults < occ.baseAdults) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["maxAdults"],
                message: "Maximum adults must be >= base adults",
            });
        }
        if (occ.maxOccupancy < occ.baseAdults) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["maxOccupancy"],
                message: "Maximum occupancy must be >= base adults",
            });
        }
    });

const RoomSchema = z.object({
    roomName: z.string().optional(),
    bedTypes: z.array(BedTypeSchema).min(1, "At least one bed type is required"),
    extraBed: z.enum(["yes", "no"]),
    alternateBed: z.enum(["yes", "no"]),
    occupancy: OccupancySchema,
});

const SleepingArrangementSchema = z.object({
    sleepingArrangement: z.array(RoomSchema),
});

type SleepingArrangementForm = z.infer<typeof SleepingArrangementSchema>;

/* ---------------------
   Component
   --------------------- */

type BedType = { type: string; count: number };
type Occupancy = {
    baseAdults: number;
    maxAdults: number;
    maxChildren: number;
    maxOccupancy: number;
};

interface SleepingArrangementProps {
    setShareData: React.Dispatch<React.SetStateAction<any>>;
    shareData: any;
    defaultData?: any;
}

export default function SleepingArrangement({
    setShareData,
    shareData,
    defaultData,
}: SleepingArrangementProps) {
    
    const { setTab } = useAppContext();

    // Build initial/default values from shareData (or defaultData)
    const initial = useMemo(() => {
        const rooms = shareData?.room_detail || [];
        const prevSleep = shareData?.sleepingArrangement || [];

        return {
            sleepingArrangement: rooms.map((room: any, idx: number) => {
                const existing = prevSleep[idx];
                return (
                    existing || {
                        roomName: room.roomName || `Room ${idx + 1}`,
                        bedTypes: [{ type: "", count: 1 }],
                        extraBed: "no",
                        alternateBed: "no",
                        occupancy: { baseAdults: 2, maxAdults: 3, maxChildren: 3, maxOccupancy: 4 },
                    }
                );
            }),
        } as SleepingArrangementForm;
    }, [shareData?.room_detail, shareData?.sleepingArrangement, defaultData]);

    const form = useForm<SleepingArrangementForm>({
        resolver: zodResolver(SleepingArrangementSchema),
        mode: "onChange",
        defaultValues: initial,
    });

    const { control, handleSubmit, reset, setValue, watch } = form;

    // If shareData.room_detail changes later, reset the form to new default
    useEffect(() => {
        reset(initial);
    }, [initial, reset]);

    // field array for rooms
    const roomsFieldArray = useFieldArray({
        control,
        name: "sleepingArrangement",
    });

    useEffect(() => {
        const subscription = watch((values) => {
            const current = JSON.stringify(shareData?.sleepingArrangement);
            const incoming = JSON.stringify(values.sleepingArrangement);
            if (current !== incoming) {
                setShareData((prev: any) => ({
                    ...prev,
                    sleepingArrangement: values.sleepingArrangement,
                }));
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, shareData, setShareData]);


    // Bed options
    const bedOptions = [
        { value: "king", label: "King Bed (6ft x 6ft)" },
        { value: "queen", label: "Queen Bed (5ft x 6ft)" },
        { value: "double", label: "Double Bed (5ft x 6ft)" },
        { value: "single", label: "Single Bed (3ft x 6ft)" },
        { value: "bunk", label: "Bunk Bed (variable size)" },
    ];

    const addBedType = (roomIdx: number) => {
        const key = `sleepingArrangement.${roomIdx}.bedTypes` as const;
        const existing = (form.getValues() as any).sleepingArrangement?.[roomIdx]?.bedTypes || [];
        setValue(key, [...existing, { type: "", count: 1 }]);
        setTimeout(() => {
            window.scrollTo(0, scrollY);
        }, 0);
    };

    const handleNext = handleSubmit((values) => {
        setShareData((prev: any) => ({
            ...prev,
            sleepingArrangement: values.sleepingArrangement,
        }));
        setTab("Room Amenities");
    });

    

    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
            <Header status={form.formState.isValid} title="Sleeping Arrangements" description="Define sleeping setup for each created room." />
            <div className="max-w-4xl mx-auto w-full bg-white p-3 rounded-xl mt-3">
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Bed className="w-6 h-6 text-muted-foreground" />
                    Sleeping Arrangements
                    {shareData?.room_detail?.length ? (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                            ({shareData.room_detail.length} {shareData.room_detail.length > 1 ? "Rooms" : "Room"})
                        </span>
                    ) : null}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Define sleeping setup for each created room.
                </p>
            </div>
            <Form {...form}>
                <div className="flex-1 p-6 space-y-6">
                    {roomsFieldArray.fields.map((roomField, roomIdx) => {
                        const bedArrayName = `sleepingArrangement.${roomIdx}.bedTypes` as const;
                        const bedFieldArray = useFieldArray({
                            control,
                            name: bedArrayName,
                        });

                        return (
                            <Card key={roomField.id} className="p-6 w-full max-w-4xl mx-auto border-0 rounded-xl shadow-none bg-white">
                                <CardHeader className="flex flex-row justify-between items-center p-0">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <Bed className="w-5 h-5 text-muted-foreground" />{" "}
                                        <span>
                                            {roomField.roomName}
                                        </span>
                                    </h2>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addBedType(roomIdx)}>
                                        <Plus className="w-4 h-4 mr-1" /> Add Bed Type
                                    </Button>
                                </CardHeader>

                                <CardContent className="space-y-4 p-0">
                                    {bedFieldArray.fields.map((bedField, bedIdx) => (
                                        <div key={bedField.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b p-3">
                                            {/* Bed Type */}
                                            <div>
                                                <FormField
                                                    control={control}
                                                    name={`sleepingArrangement.${roomIdx}.bedTypes.${bedIdx}.type` as const}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="mb-1">Bed Type</FormLabel>
                                                            <FormControl>
                                                                <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select bed type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {bedOptions.map((opt) => (
                                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                                {opt.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Bed Count */}
                                            <div>
                                                <FormField
                                                    control={control}
                                                    name={`sleepingArrangement.${roomIdx}.bedTypes.${bedIdx}.count` as const}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Number of Beds</FormLabel>
                                                            <FormControl>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            field.onChange(Math.max(1, (Number(field.value) || 1) - 1))
                                                                        }
                                                                        className="px-2"
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </Button>
                                                                    <Input
                                                                        readOnly
                                                                        className="text-center w-20"
                                                                        value={field.value ?? 1}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() => field.onChange((Number(field.value) || 1) + 1)}
                                                                        className="px-2"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}


                                    {/* Extra Bed (radio-like, required) */}
                                    <div className="space-y-1">
                                        <FormField
                                            control={control}
                                            name={`sleepingArrangement.${roomIdx}.extraBed` as const}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Can this room accommodate extra bed(s)?</FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-4">
                                                            {["no", "yes"].map((val) => (
                                                                <label key={val} className="flex items-center gap-2 text-sm">
                                                                    <input
                                                                        type="radio"
                                                                        value={val}
                                                                        checked={field.value === val}
                                                                        onChange={() => field.onChange(val)}
                                                                    />
                                                                    {val === "yes" ? "Yes" : "No"}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator />

                                    {/* Alternate Bed */}
                                    <div className="space-y-1">
                                        <FormField
                                            control={control}
                                            name={`sleepingArrangement.${roomIdx}.alternateBed` as const}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Does this room offer an alternate sleeping arrangement?</FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-4">
                                                            {["no", "yes"].map((val) => (
                                                                <label key={val} className="flex items-center gap-2 text-sm">
                                                                    <input
                                                                        type="radio"
                                                                        value={val}
                                                                        checked={field.value === val}
                                                                        onChange={() => field.onChange(val)}
                                                                    />
                                                                    {val === "yes" ? "Yes" : "No"}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>


                                    {/* Occupancy */}
                                    <div className="space-y-6 border-t pt-6">
                                        <div>
                                            <h4 className="font-semibold text-lg">Occupancy</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Occupancy details have been pre-filled based on the selected bed arrangement above
                                            </p>
                                        </div>

                                        {/* GRID layout for all fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Base Adults */}
                                            <FormField
                                                control={control}
                                                name={`sleepingArrangement.${roomIdx}.occupancy.baseAdults` as const}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-medium">Base adults</FormLabel>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            Minimum number of adults supported by the standard sleeping arrangement.
                                                        </p>
                                                        <FormControl>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => field.onChange(Math.max(1, (Number(field.value) || 1) - 1))}
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                                <Input readOnly className="text-center w-20" value={field.value ?? 2} />
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => field.onChange((Number(field.value) || 1) + 1)}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Max Adults */}
                                            <FormField
                                                control={control}
                                                name={`sleepingArrangement.${roomIdx}.occupancy.maxAdults` as const}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-medium">Maximum adults</FormLabel>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            Maximum number of adults that can be accommodated in this room.
                                                        </p>
                                                        <FormControl>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => field.onChange(Math.max(1, (Number(field.value) || 1) - 1))}
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                                <Input readOnly className="text-center w-20" value={field.value ?? 3} />
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => field.onChange((Number(field.value) || 1) + 1)}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Max Children */}
                                            <FormField
                                                control={control}
                                                name={`sleepingArrangement.${roomIdx}.occupancy.maxChildren` as const}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-medium">Maximum children</FormLabel>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            Maximum number of children that can be accommodated in this room.
                                                        </p>
                                                        <FormControl>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    type="button"
                                                                    size="icon"
                                                                    onClick={() => field.onChange(Math.max(0, (Number(field.value) || 0) - 1))}
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                                <Input readOnly className="text-center w-20" value={field.value ?? 3} />
                                                                <Button
                                                                    variant="outline"
                                                                    type="button"
                                                                    size="icon"
                                                                    onClick={() => field.onChange((Number(field.value) || 0) + 1)}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Max Occupancy */}
                                            <FormField
                                                control={control}
                                                name={`sleepingArrangement.${roomIdx}.occupancy.maxOccupancy` as const}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-medium">Maximum occupancy</FormLabel>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            Maximum number of guests that can be accommodated in this room.
                                                        </p>
                                                        <FormControl>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    type="button"
                                                                    size="icon"
                                                                    onClick={() => field.onChange(Math.max(1, (Number(field.value) || 1) - 1))}
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                                <Input readOnly className="text-center w-20" value={field.value ?? 4} />
                                                                <Button
                                                                    variant="outline"
                                                                    type="button"
                                                                    size="icon"
                                                                    onClick={() => field.onChange((Number(field.value) || 1) + 1)}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex gap-2 justify-end items-center">
                    <Button variant="outline" onClick={() => setTab("Room Details")}>
                        Back
                    </Button>
                    <Button
                        onClick={handleSubmit(() => handleNext())}
                        className="flex items-center gap-2"
                    >
                        Next Step
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </Form>
        </div>
    );
}
