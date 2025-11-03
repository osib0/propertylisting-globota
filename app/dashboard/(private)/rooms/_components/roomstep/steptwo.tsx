"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { Bed, Trash } from "lucide-react";
import { Card } from "@/components/ui/card";

// Zod validation schema
const bedSchema = z.object({
    type: z.string().min(1, "Please select a bed type"),
    count: z.number().min(1, "At least one bed required"),
});

const occupancySchema = z.object({
    baseAdults: z.number().min(1, "At least one base adult required"),
    maxAdults: z.number().min(1, "At least one max adult required"),
    maxChildren: z.number().min(0),
    maxOccupancy: z.number().min(1, "At least one total guest required"),
});

const formSchema = z.object({
    bedTypes: z.array(bedSchema).min(1, "At least one bed type is required"),
    occupancy: occupancySchema,
    extraBed: z.enum(["yes", "no"]),
    alternateBed: z.enum(["yes", "no"]).optional(), // Made optional as per UI hint
});

type BedType = z.infer<typeof bedSchema>;
type Occupancy = z.infer<typeof occupancySchema>;
type FormData = z.infer<typeof formSchema>;
type OccKey = keyof Occupancy;

export default function StepTwo({ setMaxStepReached, setStep, setLoading, propertyId, sharedFormData, setSharedFormData }: any) {
    const [bedTypes, setBedTypes] = useState<BedType[]>([{ type: "", count: 0 }]);
    const [occupancy, setOccupancy] = useState<Occupancy>({
        baseAdults: 0,
        maxAdults: 0,
        maxChildren: 0,
        maxOccupancy: 0,
    });
    const [extraBed, setExtraBed] = useState<any>("no");
    const [alternateBed, setAlternateBed] = useState<any>("no");
    const [errors, setErrors] = useState<{
        bedTypes?: { type?: string; count?: string }[];
        occupancy?: Partial<Record<keyof Occupancy, string>>;
        extraBed?: string;
        alternateBed?: string;
    }>({});

    useEffect(() => {
        if (sharedFormData.StepTwo) {
            setBedTypes(sharedFormData.StepTwo.bedTypes || [{ type: "", count: 0 }]);
            setOccupancy(sharedFormData.StepTwo.occupancy || {
                baseAdults: 0,
                maxAdults: 0,
                maxChildren: 0,
                maxOccupancy: 0,
            });
            setExtraBed(sharedFormData.StepTwo.extraBed || "no");
            setAlternateBed(sharedFormData.StepTwo.alternateBed || "no");
        }
    }, [sharedFormData]);

    const removeBedType = (index: number) => {
        if (bedTypes.length > 1) {
            const updated = bedTypes.filter((_, i) => i !== index);
            setBedTypes(updated);
        }
    };

    const handleBedTypeChange = (
        index: number,
        field: keyof BedType,
        value: BedType[keyof BedType]
    ) => {
        const updated = [...bedTypes];
        // @ts-expect-error
        updated[index][field] = value;
        setBedTypes(updated);

        // Clear specific error
        const newErrors = { ...errors };
        if (newErrors.bedTypes && newErrors.bedTypes[index]) {
            delete newErrors.bedTypes[index][field];
            setErrors(newErrors);
        }
    };

    const addBedType = () => {
        setBedTypes([...bedTypes, { type: "", count: 0 }]);
    };

    const handleNextClick = () => {
        const result = formSchema.safeParse({ bedTypes, occupancy, extraBed, alternateBed });

        if (!result.success) {
            const newErrors: typeof errors = {};

            // For bedTypes
            newErrors.bedTypes = bedTypes.map((_, i) => {
                const err: { type?: string; count?: string } = {};
                //@ts-expect-error
                const errorsForBed = result.error.errors.filter(
                    (e: any) => e.path[0] === "bedTypes" && e.path[1] === i
                );
                for (const e of errorsForBed) {
                    if (e.path[2] === "type") err.type = e.message;
                    if (e.path[2] === "count") err.count = e.message;
                }
                return err;
            });

            // For occupancy
            //@ts-expect-error
            const occupancyErrors = result.error.errors.filter((e) => e.path[0] === "occupancy");
            if (occupancyErrors.length > 0) {
                newErrors.occupancy = {};
                for (const e of occupancyErrors) {
                    const occKey = e.path[1] as OccKey;
                    newErrors.occupancy[occKey] = e.message;
                }
            }

            // For extraBed and alternateBed
            //@ts-expect-error
            const extraBedError = result.error.errors.find((e) => e.path[0] === "extraBed");
            if (extraBedError) newErrors.extraBed = extraBedError.message;
            //@ts-expect-error
            const alternateBedError = result.error.errors.find((e) => e.path[0] === "alternateBed");
            if (alternateBedError) newErrors.alternateBed = alternateBedError.message;

            setErrors(newErrors);
            return;
        }

        setErrors({});
        setSharedFormData((prev: any) => ({
            ...prev,
            StepTwo: { bedTypes, occupancy, extraBed, alternateBed },
        }));
        setMaxStepReached(3);
        setStep(3);
    };

    return (
        <Card className='w-full p-3 border-l border-y-0 rounded-none border-r-0 shadow-none gap-1'>
            <h3 className="font-normal">Sleeping Arrangement & Occupancy</h3>
            <p className="text-zinc-600 text-sm">Select bed types and how many guests this room can host</p>

            <Separator className="my-4" />
            <h6 className="text-xl">Standard Arrangement</h6>
            {bedTypes.map((bed, index) => (
                <div key={index} className="flex items-center mb-3 w-full">
                    <div className="w-full md:w-3/12">
                        <p className="font-normal text-sm">
                            Select the types of beds available in this room
                        </p>
                    </div>
                    <BedTypeSelector
                        index={index}
                        bed={bed}
                        handleBedTypeChange={handleBedTypeChange}
                        error={errors.bedTypes?.[index]?.type}
                    />
                    <div className="w-full md:w-2/12 ms-2">
                        <Label className="font-normal mb-1">Number of beds</Label>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBedTypeChange(index, "count", Math.max(0, bed.count - 1))}
                                className="h-10 px-3"
                            >
                                -
                            </Button>
                            <Input className="text-center h-10 flex-1 mx-0 border-x-0" type="number" readOnly value={bed.count} />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBedTypeChange(index, "count", bed.count + 1)}
                                className="h-10 px-3"
                            >
                                +
                            </Button>
                        </div>
                        {errors.bedTypes?.[index]?.count && (
                            <p className="text-destructive mt-1 text-xs font-medium">
                                {errors.bedTypes[index].count}
                            </p>
                        )}
                    </div>
                    {bedTypes.length > 1 && (
                        <div className="w-full md:w-1/12">
                            <Button variant="destructive" className="ms-2 mt-4 rounded-full cursor-pointer" size="icon" onClick={() => removeBedType(index)}>
                                <Trash />
                            </Button>
                        </div>
                    )}
                </div>
            ))}

            {bedTypes.length < 4 && (
                <Button variant="link" className="w-fit text-blue-600 cursor-pointer" onClick={addBedType}>
                    Add Another Bed Type
                </Button>
            )}
            {bedTypes.length >= 4 && (
                <p className="text-zinc-600">Maximum 4 bed types allowed.</p>
            )}

            <div className="mt-3 flex gap-5">
                <Label className="text-base font-normal w-1/2">Can this room accommodate extra bed(s)?</Label>
                <RadioGroup value={extraBed} onValueChange={setExtraBed} className="flex space-x-4 w-1/2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="extraNo" />
                        <Label htmlFor="extraNo">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="extraYes" />
                        <Label htmlFor="extraYes">Yes</Label>
                    </div>
                </RadioGroup>
            </div>
            {errors.extraBed && (
                <p className="text-destructive mt-1 text-xs font-medium">
                    {errors.extraBed}
                </p>
            )}

            <Separator className="my-4" />
            <h6 className="text-xl font-normal">
                Alternative Sleeping Arrangement{" "}
                <span className="font-normal text-zinc-500 text-sm">(Optional)</span>
            </h6>
            <p className="text-zinc-500">
                If the standard sleeping arrangement isn't available, the guest will get one of the alternative
                bed options below
            </p>
            <div className="flex gap-3">
                <Label className="text-base font-normal w-1/2">Does this room offer an alternate sleeping arrangement?</Label>
                <RadioGroup value={alternateBed} onValueChange={setAlternateBed} className="flex space-x-4 w-1/2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="altNo" />
                        <Label htmlFor="altNo">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="altYes" />
                        <Label htmlFor="altYes">Yes</Label>
                    </div>
                </RadioGroup>
            </div>
            {errors.alternateBed && (
                <p className="text-destructive mt-1 text-xs font-medium">
                    {errors.alternateBed}
                </p>
            )}

            <Separator className="my-4" />
            <h6 className="mt-4">Occupancy</h6>
            <p className="text-zinc-600 block mb-3">
                Occupancy details have been pre-filled based on the selected bed arrangement above
            </p>

            {[
                {
                    label: "Base adults",
                    key: "baseAdults" as OccKey,
                    description: "Minimum number of adults supported by the standard sleeping arrangement.",
                },
                {
                    label: "Maximum adults",
                    key: "maxAdults" as OccKey,
                    description: "Maximum number of adults that can be accommodated in this room.",
                },
                {
                    label: "Maximum children",
                    key: "maxChildren" as OccKey,
                    description: "Maximum number of children that can be accommodated in this room.",
                },
                {
                    label: "Maximum occupancy",
                    key: "maxOccupancy" as OccKey,
                    description: "Maximum number of guests that can be accommodated in this room.",
                },
            ].map(({ label, key, description }, i) => (
                <div className="flex items-start mb-3 w-full" key={i}>
                    <div className="w-full lg:w-5/12">
                        <h6 className="mt-4"> {label}</h6>
                        <p className="text-zinc-600 text-sm">
                            {description}
                        </p>
                    </div>
                    <div className="w-full lg:w-4/12 md:w-3/12">
                        <div className="flex">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setOccupancy((prev) => ({
                                        ...prev,
                                        [key]: Math.max(0, prev[key] - 1),
                                    }))
                                }
                                className="h-10 px-3"
                            >
                                -
                            </Button>
                            <Input className="text-center  h-10 flex-1 mx-2 border-x-0 max-w-fit" type="number" readOnly value={occupancy[key]} />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setOccupancy((prev) => ({
                                        ...prev,
                                        [key]: prev[key] + 1,
                                    }))
                                }
                                className="h-10 px-3"
                            >
                                +
                            </Button>
                        </div>
                        {errors.occupancy?.[key] && (
                            <p className="text-destructive mt-1 text-xs font-medium whitespace-nowrap">
                                {errors.occupancy[key]}
                            </p>
                        )}
                    </div>
                </div>
            ))}
            <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                    Back
                </Button>
                <Button variant="default" size="lg" onClick={handleNextClick}>
                    Next
                </Button>
            </div>
        </Card>
    );
}

type BedTypeSelectorProps = {
    index: number;
    bed: BedType;
    handleBedTypeChange: (index: number, field: keyof BedType, value: BedType[keyof BedType]) => void;
    error?: string;
};

const BedTypeSelector = ({ index, bed, handleBedTypeChange, error }: BedTypeSelectorProps) => {
    const bedOptions = [
        {
            value: "king",
            label: (
                <div className="flex items-center">
                    <Bed className="mr-2" />
                    <div>
                        <div>King Bed</div>
                        <small className="text-zinc-600">6 feet by 6 feet</small>
                    </div>
                </div>
            ),
        },
        {
            value: "queen",
            label: (
                <div className="flex items-center">
                    <Bed className="mr-2" />
                    <div>
                        <div>Queen Bed</div>
                        <small className="text-zinc-600">6 feet by 6 feet</small>
                    </div>
                </div>
            ),
        },
        {
            value: "double",
            label: (
                <div className="flex items-center">
                    <Bed className="mr-2" />
                    <div>
                        <div>Double Bed</div>
                        <small className="text-zinc-600">5 feet by 6 feet</small>
                    </div>
                </div>
            ),
        },
        {
            value: "single",
            label: (
                <div className="flex items-center">
                    <Bed className="mr-2" />
                    <div>
                        <div>Single Bed</div>
                        <small className="text-zinc-600">3 feet by 6 feet</small>
                    </div>
                </div>
            ),
        },
        {
            value: "bunk",
            label: (
                <div className="flex items-center">
                    <Bed className="mr-2" />
                    <div>
                        <div>Bunk Bed</div>
                        <small className="text-zinc-600">Variable size</small>
                    </div>
                </div>
            ),
        },
    ];

    const selectedValue = bedOptions.find((opt) => opt.value === bed.type)?.value || "";

    return (
        <div className="w-full md:w-3/12">
            <Label className="font-normal mb-1 me-2">Bed Type {index + 1}</Label>
            <Select value={selectedValue} onValueChange={(value) => handleBedTypeChange(index, "type", value)}>
                <SelectTrigger className="min-h-14 w-full">
                    <SelectValue placeholder="Select bed type" />
                </SelectTrigger>
                <SelectContent>
                    {bedOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-destructive mt-1 text-sm">
                    {error}
                </p>
            )}
        </div>
    );
};