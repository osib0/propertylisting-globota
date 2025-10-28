"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAppContext } from "../../contextapi";

interface AmenityType {
    _id: string;
    title: string;
    photo: string;
}

interface PropertyAmenitiesProps {
    setShareData: (data: any) => void;
    shareData: any;
}

export default function PropertyAmenities({
    setShareData,
    shareData,
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

            // Initialize selection state
            if (Object.keys(selectedAmenities).length === 0) {
                const initial: Record<string, "yes" | "no" | null> = {};
                amenities.forEach((d: any) => {
                    const existing = shareData?.property_amenities?.amenities?.find(
                        (a: any) => a.title === d.title
                    )?.value;
                    initial[d.title] = existing ?? null;
                });
                setSelectedAmenities(initial);
            }
        })();
    }, []);

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


    const handleNext = async () => {
        setLoading(true);
        setTab('Property Photos')
        setLoading(false);
    };



    return (
        <div className="flex flex-col w-full">
            {/* Header */}
            <div className="border-b bg-white py-4 px-6 sticky top-0 z-20 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Property Amenities</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Select which amenities are available in your property.
                </p>
            </div>

            {/* Amenity Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="w-full max-w-5xl mx-auto grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {dbAmenities.map((data) => (
                        <Card
                            key={data._id}
                            className={`p-4 rounded-2xl border hover:shadow-md transition-all duration-200 ${selectedAmenities[data.title] === "yes"
                                    ? "border-green-500 shadow-md"
                                    : selectedAmenities[data.title] === "no"
                                        ? "border-red-400"
                                        : ""
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-base truncate">{data.title}</span>
                                <Image
                                    src={data.photo}
                                    alt={data.title}
                                    width={22}
                                    height={22}
                                    className="object-contain"
                                />
                            </div>

                            <RadioGroup
                                className="flex gap-4"
                                value={selectedAmenities[data.title] || ""}
                                onValueChange={(val: "yes" | "no") =>
                                    handleAmenityChoice(data.title, val)
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="yes"
                                        id={`${data._id}-yes`}
                                        className="border-green-500 data-[state=checked]:bg-green-500"
                                    />
                                    <Label htmlFor={`${data._id}-yes`} className="text-sm cursor-pointer">
                                        Yes
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="no"
                                        id={`${data._id}-no`}
                                        className="border-red-500 data-[state=checked]:bg-red-500"
                                    />
                                    <Label htmlFor={`${data._id}-no`} className="text-sm cursor-pointer">
                                        No
                                    </Label>
                                </div>
                            </RadioGroup>
                        </Card>
                    ))}
                </div>
            </div>
            <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center">
                {/* <Button variant="outline" className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Draft
        </Button> */}
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
