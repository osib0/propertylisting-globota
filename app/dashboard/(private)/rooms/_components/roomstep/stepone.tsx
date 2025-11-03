import { FormEvent, useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'react-hot-toast';
import { z } from "zod";
import { Card } from '@/components/ui/card';

const roomCategorySchema = z.object({
    room_type: z.string().min(1, "Room type is required"),
    room_view: z.string().min(1, "Room view is required"),
    room_area: z.string().min(1, "Room size is required"),
    room_name: z.string().min(1, "Room name is required"),
    room_quantity: z.number().min(1, "Room quantity is required"),
    description: z.string().optional(),
});

type RoomCategoryForm = z.infer<typeof roomCategorySchema>;

export default function StepOne({ setMaxStepReached, setStep, setLoading, propertyId, sharedFormData, setSharedFormData }: any) {
    const [roomTypes, setRoomTypes] = useState<{ value: string; label: string }[]>([]);
    const [roomViews, setRoomViews] = useState<{ value: string; label: string }[]>([]);
    const [unit, setUnit] = useState("sqft");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof RoomCategoryForm, string>>>({});

    const [formData, setFormData] = useState<RoomCategoryForm>({
        room_type: "",
        room_view: "",
        room_area: "",
        room_name: "",
        room_quantity: 1,
        description: "",
    });

    useEffect(() => {
        if (sharedFormData.stepOne) {
            setFormData(sharedFormData.stepOne);
            // Also restore unit if saved (assuming you save it in stepOne data)
            if (sharedFormData.stepOne.unit) setUnit(sharedFormData.stepOne.unit);
        }
    }, [sharedFormData]);

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const [roomTypeRes, roomViewRes] = await Promise.all([
                    fetch("/api/roomtype/get"),
                    fetch("/api/roomview/get"),
                ]);

                if (!roomTypeRes.ok || !roomViewRes.ok) {
                    throw new Error("Failed to fetch dropdown data");
                }

                const roomTypeData = await roomTypeRes.json();
                const roomViewData = await roomViewRes.json();

                setRoomTypes(
                    (roomTypeData?.data || []).map((item: any) => ({
                        value: item.title,
                        label: item.title,
                    }))
                );

                setRoomViews(
                    (roomViewData?.data || []).map((item: any) => ({
                        value: item.title,
                        label: item.title,
                    }))
                );
            } catch (error) {
                toast.error("Error loading dropdowns");
            } finally {
                if (setLoading) setLoading(false);
            }
        }
        fetchDropdowns();
    }, [setLoading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "room_quantity") {
            const numVal = Number(value);
            setFormData((prev) => ({ ...prev, [name]: isNaN(numVal) ? 0 : numVal }));
            setErrors((prev) => ({ ...prev, [name]: "" }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSelectChange = (name: keyof RoomCategoryForm, selected: string) => {
        setFormData((prev) => ({ ...prev, [name]: selected || "" }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // We validate with zod here
        const result = roomCategorySchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof RoomCategoryForm, string>> = {};
            // @ts-expect-error
            result.error.errors.forEach((err) => {
                const fieldName = err.path[0] as keyof RoomCategoryForm;
                fieldErrors[fieldName] = err.message;
            });
            setErrors(fieldErrors);
            setSubmitting(false);
            return;
        }

        setSharedFormData((prev: any) => ({ ...prev, stepOne: { ...formData, unit } }));
        setMaxStepReached(2);
        setStep(2);
        setSubmitting(false);
    };

    return (
        <Card className='w-full p-3 border-l border-y-0 rounded-none border-r-0 shadow-none'>
            <h3 className="font-bold">Room Details</h3>
            <p className="text-zinc-600 text-sm">Add the name and key features of this room type</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">

                {/* Room Type */}
                <div className="flex flex-col md:flex-row gap-2 items-start">
                    <div className="w-full md:w-1/2">
                        <div className="font-medium">Room type</div>
                        <p className='text-zinc-600 text-sm'>Choose the type that best describes this room</p>
                    </div>
                    <div className="w-full md:w-1/2">
                        <Select name="room_type" value={formData.room_type} onValueChange={(selected) => handleSelectChange("room_type", selected)}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Choose..." />
                            </SelectTrigger>
                            <SelectContent>
                                {roomTypes.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.room_type && <p className="text-destructive text-sm">{errors.room_type}</p>}
                    </div>
                </div>

                {/* Room View */}
                <div className="flex flex-col md:flex-row gap-2 items-start">
                    <div className="w-full md:w-1/2">
                        <div className="font-medium">Room view</div>
                        <p className='text-zinc-600 text-sm'>Describe what the guest will see from this room</p>
                    </div>
                    <div className="w-full md:w-1/2">
                        <Select name="room_view" value={formData.room_view} onValueChange={(selected) => handleSelectChange("room_view", selected)}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Choose..." />
                            </SelectTrigger>
                            <SelectContent>
                                {roomViews.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.room_view && <p className="text-destructive text-sm">{errors.room_view}</p>}
                    </div>
                </div>

                {/* Room Size */}
                <div className="mb-4 flex flex-col md:flex-row gap-2 items-start">
                    {/* Left Column: Label and Description */}
                    <div className="w-full xxl:w-6/12 mb-2 lg:mb-0">
                        <div className="font-medium">Room Size (Area)</div>
                        <p className="mb-0 text-zinc-600 text-sm">Specify the indoor area of the room in square units</p>
                    </div>
                    <div className="w-full xxl:w-6/12">
                        <div className="flex lg:flex gap-3 items-center">
                            <RadioGroup value={unit} onValueChange={setUnit} className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sqft" id="sqft" />
                                    <Label htmlFor="sqft" className="whitespace-nowrap font-semibold text-xs">
                                        Square Feet
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sqm" id="sqm" />
                                    <Label htmlFor="sqm" className="whitespace-nowrap font-semibold text-xs">
                                        Square Meter
                                    </Label>
                                </div>
                            </RadioGroup>
                            <div className="flex-1">
                                <Input
                                    name="room_area"
                                    value={formData.room_area}
                                    onChange={handleChange}
                                    className={errors.room_area ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {errors.room_area && <p className="text-destructive text-sm">{errors.room_area}</p>}

                            </div>
                        </div>
                    </div>
                </div>

                {/* Room Name */}
                <div className="flex flex-col md:flex-row gap-2 items-start">
                    <div className="w-full md:w-1/2">
                        <div className="font-medium">Room Name</div>
                        <p>Add a room name that looks attractive to travellers</p>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col">
                        <Input
                            name="room_name"
                            value={formData.room_name}
                            onChange={handleChange}
                            placeholder="Luxury Room"
                            className={errors.room_name ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.room_name && <p className="text-destructive text-sm">{errors.room_name}</p>}
                    </div>
                </div>

                {/* Room Quantity */}
                <div className="flex flex-col md:flex-row gap-2 items-start">
                    <div className="w-full md:w-1/2">
                        <div className="font-medium">Number of rooms</div>
                        <p>Specify how many rooms of this type are at your property</p>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col">
                        <Input
                            type="number"
                            name="room_quantity"
                            value={formData.room_quantity}
                            onChange={handleChange}
                            min={1}
                            className={errors.room_quantity ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.room_quantity && <p className="text-destructive text-sm">{errors.room_quantity}</p>}
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col md:flex-row gap-2 items-start">
                    <div className="w-full md:w-1/2">
                        <div className="font-medium">Description</div>
                        <p>Highlight what makes this room appealing — view, comfort, features.</p>
                    </div>
                    <div className="w-full md:w-1/2">
                        <Textarea
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Write the description"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button type="submit">
                        Next
                    </Button>
                </div>
            </form>
        </Card>
    );
}