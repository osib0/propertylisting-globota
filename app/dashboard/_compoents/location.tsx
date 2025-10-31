"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAppContext } from "../../contextapi";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Header from "./header";

const MapPicker = dynamic(
    () => import("./map"),
    { ssr: false }
);

const locationSchema = z.object({
    addressLine1: z.string().min(1, "Address Line 1 is required"),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(1, "City is required"),
    stateName: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode").optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationProps {
    shareData?: any;
    setShareData: (data: any) => void;
    defaultData: any
}

export default function Location({ shareData = {}, setShareData, defaultData }: LocationProps) {
    const { setTab } = useAppContext();
    const [loading, setLoading] = useState(false);


    const form = useForm<LocationFormData>({
        resolver: zodResolver(locationSchema),
        mode: 'onChange',
        defaultValues: {
            addressLine1: shareData?.location?.addressLine1 || defaultData?.addressLine1 || "",
            addressLine2: shareData?.location?.addressLine2 || defaultData?.addressLine2 || "",
            landmark: shareData?.location?.landmark || defaultData?.landmark || "",
            city: shareData?.location?.city || defaultData?.city || "",
            stateName: shareData?.location?.stateName || defaultData?.stateName || "",
            country: shareData?.location?.country || defaultData?.country || "India",
            pincode: shareData?.location?.pincode || defaultData?.pincode || "",
        },

    });
    // Sync data with parent
    useEffect(() => {
        const subscription = form.watch((values) => {
            const timer = setTimeout(() => {
                setShareData((prev: any) => ({
                    ...prev,
                    location: values,
                }));
            }, 300);
            return () => clearTimeout(timer);
        });
        return () => subscription.unsubscribe();
    }, [form, setShareData]);





    const handleNext = async () => {
        setLoading(true);
        const valid = await form.trigger();
        if (valid) {
            setTab('Property Amenities')
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col w-full">
            <Header status={form.formState.isValid} title="Location" description="Provide your property address and pin it on the map." />
            <div className="flex-1 overflow-y-auto p-6">
                <Card className="p-6 w-full max-w-4xl mx-auto border-0 rounded-xl shadow-none bg-white">
                    <h1 className="text-xl font-normal">Add Location Details</h1>

                    <Form {...form}>
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-5">
                                <FormField
                                    control={form.control}
                                    name="addressLine1"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>
                                                Address Line 1 <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Property / Building / Street"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="absolute -bottom-5 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="landmark"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Landmark</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Near ..." {...field} />
                                            </FormControl>
                                            <FormMessage className="absolute -bottom-5 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="addressLine2"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Address Line 2</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Area / Locality / Neighborhood"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="absolute -bottom-5 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem className="relative">
                                                <FormLabel>
                                                    City <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Jaisalmer" {...field} />
                                                </FormControl>
                                                <FormMessage className="absolute -bottom-5 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="stateName"
                                        render={({ field }) => (
                                            <FormItem className="relative">
                                                <FormLabel>
                                                    State <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Rajasthan" {...field} />
                                                </FormControl>
                                                <FormMessage className="absolute -bottom-5 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem className="relative">
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="India" {...field} />
                                                </FormControl>
                                                <FormMessage className="absolute -bottom-5 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="pincode"
                                        render={({ field }) => (
                                            <FormItem className="relative">
                                                <FormLabel>Pincode</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="6-digit pincode" {...field} />
                                                </FormControl>
                                                <FormMessage className="absolute -bottom-5 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Right Column - Map Picker */}
                            <div className="flex flex-col">
                                <FormItem className="relative">
                                    <FormLabel>Pick on Map</FormLabel>
                                    <div className="h-80 rounded-lg overflow-hidden border">
                                        <MapPicker
                                            onChange={(pos, details) => {
                                                if (details) {
                                                    form.setValue("addressLine1", details.addressLine1 || "");
                                                    form.setValue("addressLine2", details.addressLine2 || "");
                                                    form.setValue("landmark", details.landmark || "");
                                                    form.setValue("city", details.city || "");
                                                    form.setValue("stateName", details.state || "");
                                                    form.setValue("country", details.country || "India");
                                                    form.setValue("pincode", details.pincode || "");
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Tip: Drag the marker or tap on the map to set exact coordinates.
                                    </p>
                                </FormItem>
                            </div>
                        </form>
                    </Form>
                </Card>
            </div>
            <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => setTab('Property Details')}>
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
