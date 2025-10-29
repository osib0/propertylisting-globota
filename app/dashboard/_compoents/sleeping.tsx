"use client";

import React, { useEffect, useState } from "react";
import { Bed, Info, Plus, Minus, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "../../contextapi";

type BedType = { type: string; count: number };
type Occupancy = {
    baseAdults: number;
    maxAdults: number;
    maxChildren: number;
    maxOccupancy: number;
};
type OccKey = keyof Occupancy;

interface SleepingArrangementProps {
    setShareData: React.Dispatch<React.SetStateAction<any>>;
    shareData: any;
    loading?: boolean;
}

export default function SleepingArrangement({
    setShareData,
    shareData,
}: SleepingArrangementProps) {
    const [bedTypes, setBedTypes] = useState<BedType[]>([{ type: "", count: 0 }]);
    const [extraBed, setExtraBed] = useState("no");
    const [alternateBed, setAlternateBed] = useState("no");
    const [occupancy, setOccupancy] = useState<Occupancy>({
        baseAdults: 2,
        maxAdults: 3,
        maxChildren: 3,
        maxOccupancy: 4,
    });
    const [loading, setLoading] = useState(false);
    const { setTab } = useAppContext();


    // Load existing data
    useEffect(() => {
        if (shareData?.sleepingArrangement) {
            setBedTypes(shareData.sleepingArrangement.bedTypes || [{ type: "", count: 0 }]);
            setExtraBed(shareData.sleepingArrangement.extraBed || "no");
            setAlternateBed(shareData.sleepingArrangement.alternateBed || "no");
            setOccupancy(
                shareData.sleepingArrangement.occupancy || {
                    baseAdults: 2,
                    maxAdults: 3,
                    maxChildren: 3,
                    maxOccupancy: 4,
                }
            );
        }
    }, []);

    // Sync data upward
    useEffect(() => {
        setShareData((prev: any) => ({
            ...prev,
            sleepingArrangement: {
                bedTypes,
                extraBed,
                alternateBed,
                occupancy,
            },
        }));
    }, [bedTypes, extraBed, alternateBed, occupancy, setShareData]);

    const bedOptions = [
        { value: "king", label: "King Bed (6ft x 6ft)" },
        { value: "queen", label: "Queen Bed (5ft x 6ft)" },
        { value: "double", label: "Double Bed (5ft x 6ft)" },
        { value: "single", label: "Single Bed (3ft x 6ft)" },
        { value: "bunk", label: "Bunk Bed (variable size)" },
    ];

    const handleBedTypeChange = (index: number, field: keyof BedType, value: any) => {
        const updated: any = [...bedTypes];
        updated[index][field] = value;
        setBedTypes(updated);
    };

    const addBedType = () => {
        setBedTypes([...bedTypes, { type: "", count: 0 }]);
    };

    const handleNext = async () => {
        setLoading(true);
        setTab('Room Amenities')
        setLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen w-full">
            {/* Header */}
            <div className="border-b bg-white py-4 px-6 sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Info className="w-5 h-5 text-muted-foreground" />
                        Room Details
                    </h2>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6 p-6 bg-gray-50 ">
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addBedType}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Bed Type
                    </Button>
                </div>
                <div className="max-w-3xl mx-auto space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Bed className="w-5 h-5 text-muted-foreground" /> Sleeping Arrangement & Occupancy
                </h3>

                {bedTypes.map((bed, index) => (
                    <Card key={index} className="border rounded-xl shadow-none bg-transparent">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <h3 className="font-semibold">Bed Type {index + 1}</h3>
                            {index > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setBedTypes(bedTypes.filter((_, i) => i !== index))}
                                >
                                    Remove
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                            {/* Bed Type Select */}
                            <div>
                                <Label className="mb-1">Bed Type</Label>
                                <Select
                                    value={bed.type}
                                    onValueChange={(value) => handleBedTypeChange(index, "type", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select bed type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bedOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div className="flex items-center gap-2">
                                                    <Bed className="w-4 h-4" /> {opt.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Number of Beds */}
                            <div>
                                <Label>Number of Beds</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleBedTypeChange(index, "count", Math.max(0, bed.count - 1))}
                                        className="px-2"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <Input readOnly className="text-center w-20" value={bed.count} />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleBedTypeChange(index, "count", bed.count + 1)}
                                        className="px-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Separator />

                {/* Extra Bed Option */}
                <div className="space-y-2">
                    <Label>Can this room accommodate extra bed(s)?</Label>
                    <div className="flex gap-4">
                        {["no", "yes"].map((val) => (
                            <label key={val} className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    value={val}
                                    checked={extraBed === val}
                                    onChange={() => setExtraBed(val)}
                                />
                                {val === "yes" ? "Yes" : "No"}
                            </label>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Alternate Bed Option */}
                <div className="space-y-2">
                    <Label>Does this room offer an alternate sleeping arrangement?</Label>
                    <div className="flex gap-4">
                        {["no", "yes"].map((val) => (
                            <label key={val} className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    value={val}
                                    checked={alternateBed === val}
                                    onChange={() => setAlternateBed(val)}
                                />
                                {val === "yes" ? "Yes" : "No"}
                            </label>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Occupancy */}
                <div>
                    <h3 className="font-semibold mb-2">Occupancy</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Occupancy details have been pre-filled based on the selected bed arrangement.
                    </p>

                    {[
                        { label: "Base Adults", key: "baseAdults" as OccKey },
                        { label: "Maximum Adults", key: "maxAdults" as OccKey },
                        { label: "Maximum Children", key: "maxChildren" as OccKey },
                        { label: "Maximum Occupancy", key: "maxOccupancy" as OccKey },
                    ].map(({ label, key }) => (
                        <div key={key} className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 mb-3">
                            <Label>{label}</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setOccupancy((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }))
                                    }
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <Input readOnly className="text-center w-20" value={occupancy[key]} />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setOccupancy((prev) => ({ ...prev, [key]: prev[key] + 1 }))}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex gap-2 justify-end items-center">
                <Button variant={'outline'} onClick={()=>setTab('Room Details')}>Back</Button>
                <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex items-center gap-2"
                >
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
