"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import { useAppContext } from "../../contextapi";
import Header from "./header";

interface AmenityType {
    _id: string;
    title: string;
    photo: string;
}

interface PropertyAmenitiesProps {
    setShareData: (data: any) => void;
    shareData: any;
    defaultData: any
}

export default function PropertyAmenities({
    setShareData,
    shareData,
    defaultData
}: PropertyAmenitiesProps) {
    const [dbAmenities, setDbAmenities] = useState<AmenityType[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<
        Record<string, "yes" | "no" | null>
    >({});
    const [loading, setLoading] = useState(false);
    const { setTab } = useAppContext();





    // Fetch amenities from API
    useEffect(() => {
        (async () => {
            const res = await fetch("/api/propertyamenities/get");
            const data = await res.json();
            const amenities = data?.data || [];
            setDbAmenities(amenities);

            const initial: Record<string, "yes" | "no" | null> = {};
            amenities.forEach((d: any) => {
                const existingValue =
                    defaultData?.amenities?.find(
                        (a: any) => a.title === d.title
                    )?.value ??
                    shareData?.property_amenities?.amenities?.find(
                        (a: any) => a.title === d.title
                    )?.value ??
                    null;

                initial[d.title] =
                    existingValue === "yes" ? "yes" : existingValue === "no" ? "no" : null;
            });

            setSelectedAmenities(initial);
        })();
    }, [defaultData]);

    // Update selected amenities in parent
    useEffect(() => {
        setShareData((prev: any) => ({
            ...prev,
            property_amenities: {
                amenities: Object.entries(selectedAmenities).map(([title, value]) => ({
                    title,
                    value,
                })),
            },
        }));
    }, [selectedAmenities, setShareData]);

    const handleAmenityChoice = (title: string, choice: "yes" | "no") => {
        setSelectedAmenities((prev) => ({
            ...prev,
            [title]: prev[title] === choice ? null : choice,
        }));
    };

    const summary = useMemo(() => {
        const totalAmenities = dbAmenities.length;
        const selectedCount = Object.values(selectedAmenities).filter(
            (val) => val === "yes"
        ).length;
        return { totalAmenities, selectedCount };
    }, [selectedAmenities, dbAmenities]);



    const handleNext = async () => {
        setTab('Property Photos')
    };
    return (
        <div className="flex flex-col w-full">

            <Header title="Property Amenities" description="Select which amenities are available in your property." />

            {/* Amenity Grid */}
            <div className="flex-1 overflow-y-auto">
                {/* Summary Bar */}
                <div className="px-6 py-3 mt-3 mb-4 flex flex-wrap justify-between items-center max-w-6xl mx-auto w-full text-sm text-gray-700 rounded-xl bg-white">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                            Total Amenities: {summary.totalAmenities}
                        </span>
                    </div>
                    <span>Selected: {summary.selectedCount}</span>
                </div>

                <div className="w-full max-w-4xl mx-auto grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* <div className="w-full max-w-4xl mx-auto flex flex-wrap gap-2"> */}
                    {dbAmenities.map((data) => (
                        <Card
                            key={data._id}
                            className={`p-3 rounded-2xl border hover:shadow-md transition-all duration-200 ${selectedAmenities[data.title] === "yes"
                                ? "border-green-500 shadow-md"
                                : selectedAmenities[data.title] === "no"
                                    ? "border-red-400"
                                    : ""
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <Image
                                        src={data.photo}
                                        alt={data.title}
                                        width={12}
                                        height={12}
                                        className="object-contain"
                                    />
                                    <span className="font-medium text-[11px] truncate">{data.title}</span>
                                </div>
                                <RadioGroup
                                    className="flex gap-1"
                                    value={selectedAmenities[data.title] || ""}
                                    onValueChange={(val: "yes" | "no") =>
                                        handleAmenityChoice(data.title, val)
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        <RadioGroupItem
                                            value="yes"
                                            id={`${data._id}-yes`}
                                            className="h-3 w-3"
                                        />
                                        <Label htmlFor={`${data._id}-yes`} className="cursor-pointer text-[11px]">
                                            Yes
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <RadioGroupItem
                                            value="no"
                                            id={`${data._id}-no`}
                                            className="h-3 w-3"
                                        />
                                        <Label htmlFor={`${data._id}-no`} className="cursor-pointer text-[11px]">
                                            No
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>


                        </Card>
                    ))}
                </div>
            </div>
            <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => setTab('Location')} >
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
