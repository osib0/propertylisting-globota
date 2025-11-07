"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { Check, Star, Loader2 } from "lucide-react";
import { useAppContext } from "@/app/contextapi";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";

interface AmenityItem {
    _id: string;
    title: string;
    photo: string
}

interface Category {
    _id: string;
    title: string;
}

interface SelectedItem {
    id: string;
    featured: boolean;
}

interface SelectedCategory {
    category_id: string;
    item: SelectedItem[];
}


const Amenities = () => {
    const [amenities, setAmenities] = useState<AmenityItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<string>("");
    const [selectedAmenities, setSelectedAmenities] = useState<SelectedCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    const { propertyId, userId } = useAppContext()

    const fetchCategories = async () => {
        const res = await fetch(`/api/propertyamenitiestype/get`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const json = await res.json();
        console.log(json, 'json');

        return json.data as Category[];
    };

    const fetchAmenities = async (categoryId: string) => {
        console.log(categoryId, 'categoryid');

        const res = await fetch(`/api/propertyamenities/fromCategory?categoryId=${categoryId}`);
        if (!res.ok) throw new Error("Failed to fetch amenities");
        const json = await res.json();
        console.log(json, 'json');

        setAmenities(json?.data || []);
    };

    const fetchSavedAmenities = async () => {
        try {
            const res = await fetch(`/api/property/get?propertyId=${propertyId}`);
            if (!res.ok) throw new Error("Failed to fetch saved amenities");
            const json = await res.json();

            const normalized = (json?.data?.property_amenities || []).map((cat: any) => ({
                category_id: cat.category_id,
                item: (cat.item || []).map((a: any) => ({ id: a.id || a._id, featured: !!a.featured })),
            })) as SelectedCategory[];
            setSelectedAmenities(normalized);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            try {
                setLoading(true);
                const cats = await fetchCategories();
                if (!mounted) return;
                setCategories(cats || []);
                if (cats && cats.length > 0) {
                    setActiveCategoryId(cats[0]._id);
                    await fetchAmenities(cats[0]._id);
                }
                await fetchSavedAmenities();
            } catch (err) {
                console.error(err);
                toast.error("Initialization failed");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        init();
        return () => {
            mounted = false;
        };
    }, [propertyId]);

    async function changeCategory(categoryId: string) {
        if (hasChanges) {
            // auto-save before switching category
            await handleSubmit();
            setHasChanges(false);
        }
        setActiveCategoryId(categoryId);
        setLoading(true);
        await fetchAmenities(categoryId);
        await fetchSavedAmenities();
        setLoading(false);
    }

    function toggleAmenity(amenityId: string, categoryId: string, checked: boolean, featured = false) {
        setSelectedAmenities((prev) => {
            const updated = [...prev];
            const cat = updated.find((c) => c.category_id === categoryId);
            if (cat) {
                if (checked) {
                    // add or update
                    const exists = cat.item.find((it) => it.id === amenityId);
                    if (!exists) cat.item.push({ id: amenityId, featured });
                    else exists.featured = featured;
                } else {
                    cat.item = cat.item.filter((it) => it.id !== amenityId);
                }
                return updated.map((c) => (c.category_id === categoryId ? { ...c, item: cat.item } : c));
            } else {
                if (checked) return [...updated, { category_id: categoryId, item: [{ id: amenityId, featured }] }];
                return updated;
            }
        });
        setHasChanges(true);
    }

    function toggleFeatured(amenityId: string, categoryId: string, featured: boolean) {
        setSelectedAmenities((prev) =>
            prev.map((c) =>
                c.category_id === categoryId
                    ? { ...c, item: c.item.map((it) => (it.id === amenityId ? { ...it, featured } : it)) }
                    : c
            )
        );
        setHasChanges(true);
    }

    // async function handleSubmit() {
    //     try {
    //         setSaving(true);
    //         const payload = selectedAmenities.map((c) => ({
    //             category_id: c.category_id,
    //             item: c.item.map((i) => ({ id: i.id, featured: i.featured })),
    //         }));

    //         const res = await fetch(`/api/property/edit/property_amenities/${propertyId}`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ amenities: payload }),
    //         });

    //         if (!res.ok) {
    //             const err = await res.json();
    //             throw new Error(err?.error || "Save failed");
    //         }

    //         toast.success("Amenities updated");
    //         await fetchSavedAmenities();
    //         setHasChanges(false);
    //     } catch (e) {
    //         console.error(e);
    //         toast.error("Failed to save amenities");
    //     } finally {
    //         setSaving(false);
    //     }
    // }


    async function handleSubmit() {
        try {
            setSaving(true);
            const payload = selectedAmenities.map((c) => ({
                category_id: c.category_id,
                item: c.item.map((i) => ({ id: i.id, featured: i.featured })),
            }));

            const res = await fetch(`/api/history/propertyamenities/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyId,
                    userId: userId,
                    newAmenities: payload,
                }),
            });

            const json = await res.json();
            if (!json.status) throw new Error(json.message);

            toast.success(json.message || "Amenities change submitted for approval");
            setHasChanges(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit amenities changes");
        } finally {
            setSaving(false);
        }
    }



    const isAmenitySelected = (amenityId: string) =>
        !!selectedAmenities.find((c) => c.category_id === activeCategoryId && c.item.some((it) => it.id === amenityId));

    const isAmenityFeatured = (amenityId: string) =>
        !!selectedAmenities.find((c) => c.category_id === activeCategoryId && c.item.some((it) => it.id === amenityId && it.featured));

    return (
        <div>
            <Card className="max-w-7xl bg-white rounded-none border-0 shadow-none mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">Property Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Select the amenities available at your property.</p>

                    <div className="mt-4 grid grid-cols-12 gap-4">
                        <div className="col-span-3 max-h-[420px] overflow-y-auto">
                            <div className="space-y-2">
                                {loading ? (
                                    <div className="space-y-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 p-2 rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm animate-pulse"
                                            >
                                                <Skeleton className="h-5 w-5 rounded-full" />
                                                <Skeleton className="h-5 w-32 rounded-md" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    categories.map((cat) => (
                                        <Button
                                            key={cat._id}
                                            onClick={() => changeCategory(cat._id)}
                                            variant={'outline'}
                                            className={`w-full rounded-xl ${activeCategoryId === cat._id ? 'border-blue-700 shadow-2xl' : ''}`}
                                        >
                                            <span className="font-medium">{cat.title}</span>
                                            {activeCategoryId === cat._id && <Check className="ml-2 text-blue-700" />}
                                        </Button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="col-span-9 max-h-[420px] overflow-y-auto overflow-visible">
                            <ul className="space-y-2">
                                {loading
                                    ? (
                                        <ul className="space-y-2">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm animate-pulse"
                                                >
                                                    <div className="flex justify-between items-center space-y-2 w-full">
                                                        <Skeleton className="h-5 w-1/3 rounded-md m-0 p-0" />
                                                        <div className="flex items-center justify-end gap-6">
                                                            <Skeleton className="h-5 w-16 rounded-md" />
                                                            <Skeleton className="h-5 w-16 rounded-md" />
                                                            <Skeleton className="h-5 w-20 rounded-md" />
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                    : amenities.map((amen) => {
                                        const selected = isAmenitySelected(amen._id);
                                        const featured = isAmenityFeatured(amen._id);

                                        return (
                                            <li
                                                key={amen._id}
                                                className="flex items-center justify-between p-3 border bg-white rounded-xl shadow-lg"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Image src={amen.photo} width={20} height={20} alt="icon" />
                                                    <div className="font-medium">{amen.title}</div>
                                                </div>

                                                <div className="flex items-center gap-8 bg-zinc-50 px-4 py-2 rounded-full">
                                                    <RadioGroup
                                                        defaultValue={selected ? "yes" : "no"}
                                                        className="flex items-center gap-4"
                                                        onValueChange={(value) => {
                                                            toggleAmenity(
                                                                amen._id,
                                                                activeCategoryId,
                                                                value === "yes",
                                                                featured
                                                            );
                                                        }}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="yes" id={`yes-${amen._id}`} />
                                                            <Label htmlFor={`yes-${amen._id}`} className="text-sm font-medium">
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="no" id={`no-${amen._id}`} />
                                                            <Label htmlFor={`no-${amen._id}`} className="text-sm font-medium">
                                                                No
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                    <div
                                                        className={`flex items-center gap-2 ${!selected ? "opacity-50 pointer-events-none" : ""
                                                            }`}
                                                    >
                                                        <Checkbox
                                                            id={`featured-${amen._id}`}
                                                            checked={featured}
                                                            onCheckedChange={(checked) =>
                                                                toggleFeatured(amen._id, activeCategoryId, checked === true)
                                                            }
                                                            className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                                        />
                                                        <Label htmlFor={`featured-${amen._id}`} className="text-sm font-medium">
                                                            Featured
                                                        </Label>
                                                        {featured && <Star className="h-4 w-4 text-amber-500" />}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                            </ul>
                        </div>

                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => { setSelectedAmenities([]); setHasChanges(true); }}>
                            Clear
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={saving || loading}
                            className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2 cursor-pointer rounded-xl"

                        >
                            {saving ? (
                                <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Saving...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Check /> Update</span>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Amenities;
