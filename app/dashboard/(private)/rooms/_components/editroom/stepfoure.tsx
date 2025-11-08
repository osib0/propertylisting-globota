
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Amenity { _id: string; title: string }
interface Category { _id: string; title: string }
interface AmenityItem { id: string; featured: boolean }
interface SelectedCategory { category_id: string; item: AmenityItem[] }

export default function EditStepFour({ id, setSharedFormData }: any) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<SelectedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function fetchAmenities(categoryId: string) {
    try {
      const res = await fetch(`/api/roomamenities/fromCategory?categoryId=${categoryId}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setAmenities(json?.data || []);
    } catch {
      toast.error("Failed to load amenities");
    }
  }

  async function fetchSavedAmenities() {
    try {
      const response = await fetch(`/api/rooms/get/${id}`);
      if (!response.ok) throw new Error("Failed to fetch saved amenities");
      const result = await response.json();
      const normalized: SelectedCategory[] = (result?.data?.room_amenities || []).map((cat: any) => ({
        category_id: String(cat?.category_id || ""),
        item: Array.isArray(cat?.item) ? cat.item.filter(Boolean).map((x: any) => ({ id: String(x?.id ?? x?._id ?? ""), featured: Boolean(x?.featured) })).filter((x: AmenityItem) => x.id) : [],
      }));
      setSelectedAmenities(normalized);
      setSharedFormData((p: any) => ({ ...p, room_amenities: normalized }));
    } catch {
      toast.error("Failed to load saved amenities");
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/roomamenitiestype/get`);
        if (!res.ok) throw new Error();
        const result = await res.json();
        const cats: Category[] = result?.data || [];
        setCategories(cats);
        if (cats.length) {
          setActiveCategoryId(cats[0]._id);
          await fetchAmenities(cats[0]._id);
        }
        await fetchSavedAmenities();
      } catch {
        toast.error("Failed to initialize amenities");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, setSharedFormData]);

  async function switchCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    setLoading(true);
    await fetchAmenities(categoryId);
    setLoading(false);
  }

  function inputHandler(amenityId: string, categoryId: string, value: "yes" | "no", featured?: boolean) {
    setSelectedAmenities((prev) => {
      const existing = prev.find((c) => c.category_id === categoryId);
      let next: SelectedCategory[];
      if (existing) {
        let items = [...existing.item];
        if (value === "yes") {
          const idx = items.findIndex((i) => i.id === amenityId);
          if (idx === -1) items.push({ id: amenityId, featured: Boolean(featured) });
          else if (typeof featured === "boolean") items[idx].featured = featured;
        } else items = items.filter((i) => i.id !== amenityId);
        next = prev.map((c) => (c.category_id === categoryId ? { ...c, item: items } : c));
      } else if (value === "yes") {
        next = [...prev, { category_id: categoryId, item: [{ id: amenityId, featured: Boolean(featured) }] }];
      } else next = prev;

      setSharedFormData((p: any) => ({ ...p, room_amenities: next }));
      return next;
    });
  }

  const isSelected = (amenityId: string) => selectedAmenities.some((c) => c.category_id === activeCategoryId && c.item.some((i) => i.id === amenityId));
  const isFeatured = (amenityId: string) => selectedAmenities.some((c) => c.category_id === activeCategoryId && c.item.some((i) => i.id === amenityId && i.featured));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold">Room Amenity Details</h4>
        <Button variant="link" className="px-0" onClick={() => setOpen(!open)}>
          {open ? "Cancel" : "Edit"}
        </Button>
      </div>
      <div className="border-t my-3" />

      {!open ? (
        <div className="px-1 py-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-muted-foreground text-[12px] font-semibold">Amenities added</div>
              <div className="font-semibold">{selectedAmenities.reduce((s, c) => s + c.item.length, 0)} amenities</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 w-full">
          <h3 className="mb-1 text-xl font-semibold">Room Amenities</h3>
          <p className="text-sm text-muted-foreground">Select the room amenities available at your property.</p>

          <div className="mt-4 grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-3 space-y-2 max-h-[420px] overflow-y-auto">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-2 rounded-xl border bg-muted/40">
                    <Skeleton className="h-5 w-40" />
                  </div>
                ))
              ) : (
                categories.map((cat) => (
                  <Button
                    key={cat._id}
                    variant="outline"
                    className={`w-full rounded-xl ${activeCategoryId === cat._id ? "border-primary" : ""}`}
                    onClick={() => switchCategory(cat._id)}
                  >
                    {cat.title}
                  </Button>
                ))
              )}
            </div>

            <div className="col-span-12 lg:col-span-9 max-h-[420px] overflow-y-auto">
              <ul className="space-y-2">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <li key={i} className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm">
                        <Skeleton className="h-5 w-1/3" />
                        <div className="flex gap-4">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </li>
                    ))
                  : amenities.map((amenity) => (
                      <li key={amenity._id} className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm">
                        <div className="font-medium">{amenity.title}</div>
                        <div className="flex items-center gap-6 bg-muted/40 px-4 py-2 rounded-full">
                          <RadioGroup
                            value={isSelected(amenity._id) ? "yes" : "no"}
                            onValueChange={(v) => inputHandler(amenity._id, activeCategoryId, v as any)}
                            className="flex items-center gap-4"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="yes" id={`y-${amenity._id}`} />
                              <Label htmlFor={`y-${amenity._id}`} className="text-sm font-medium">Yes</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="no" id={`n-${amenity._id}`} />
                              <Label htmlFor={`n-${amenity._id}`} className="text-sm font-medium">No</Label>
                            </div>
                          </RadioGroup>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`f-${amenity._id}`}
                              checked={isFeatured(amenity._id)}
                              disabled={!isSelected(amenity._id)}
                              onCheckedChange={(checked) => inputHandler(amenity._id, activeCategoryId, "yes", Boolean(checked))}
                            />
                            <Label htmlFor={`f-${amenity._id}`} className="text-sm font-medium">Featured</Label>
                          </div>
                        </div>
                      </li>
                    ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}