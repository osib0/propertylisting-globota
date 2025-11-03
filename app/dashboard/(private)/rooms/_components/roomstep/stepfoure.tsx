"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
/** ===== Types ===== */
type Amenity = { _id: string; title: string };
type Category = { _id: string; title: string };

type AmenityItem = { id: string; featured: boolean };
type SelectedCategory = { category_id: string; item: AmenityItem[] };

// type StepFourProps = {
//   setAddRoom: (b: boolean) => void;
//   setMaxStepReached: (n: number) => void;
//   propertyId: string;
//   sharedFormData: any;
//   setSharedFormData: (updater: any) => void;
// };

const StepFour = ({
  setAddRoom,
  setMaxStepReached,
  propertyId,
  sharedFormData,
  setSharedFormData,
}: any) => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [categorys, setCategorys] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [selectedAmenities, setSelectedAmenities] = useState<SelectedCategory[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [submiting, setSubmiting] = useState<boolean>(false);

  /** Fetch amenities for a specific category */
  const fetchAmenities = async (id: string) => {
    try {
      const response = await fetch(`/api/roomamenities/fromCategory/${id}`);
      if (!response.ok) throw new Error("Failed to fetch amenities");
      const result = await response.json();
      setAmenities(result?.data || []);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast.error("Failed to load amenities.");
    }
  };

  /** Fetch saved amenities for the room (normalize to {id, featured}) */
  const fetchSavedAmenities = async () => {
    try {
      const response = await fetch(`/api/rooms/get/${propertyId}`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to fetch saved amenities");
      const result = await response.json();

      console.log(result,'result');
      
      const saved: SelectedCategory[] = (result?.data?.room_amenities || []).map(
        (cat: any) => ({
          category_id: String(cat?.category_id || ""),
          item: Array.isArray(cat?.item)
            ? cat.item
                .filter(Boolean)
                .map((x: any) => ({
                  id: String(x?.id ?? x?._id ?? ""),
                  featured: Boolean(x?.featured),
                }))
                .filter((x: AmenityItem) => x.id) // drop empties
            : [],
        })
      );

      setSelectedAmenities(saved);
    } catch (err) {
      console.error("Error fetching saved amenities:", err);
      toast.error("Failed to load saved amenities.");
    }
  };

  /** Initialize categories + first category amenities + saved amenities */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/roomamenitiestype/get`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        const result = await response.json();
        const cats: Category[] = result?.data || [];
        setCategorys(cats);

        if (cats.length > 0) {
          const firstCategoryId = cats[0]._id;
          setActiveCategoryId(firstCategoryId);
          await fetchAmenities(firstCategoryId);
        }
        await fetchSavedAmenities();
      } catch (err) {
        console.error("Initialization error:", err);
        toast.error("Failed to initialize amenities.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [propertyId]);

  /** Change category */
  async function listupdateHandler(categoryId: string) {
    setActiveCategoryId(categoryId);
    setLoading(true);
    await fetchAmenities(categoryId);
    setLoading(false);
  }

  /**
   * Handle amenity selection & featured toggle
   * value: "yes" | "no"
   * featured: optional boolean when toggling the checkbox
   */
  function inputHandler(
    amenityId: string,
    categoryId: string,
    value: "yes" | "no",
    featured?: boolean
  ) {
    setSelectedAmenities((prev) => {
      const existing = prev.find((c) => c.category_id === categoryId);
      let next: SelectedCategory[];

      if (existing) {
        // Work on a copy
        let items = [...existing.item];

        if (value === "yes") {
          const idx = items.findIndex((i) => i.id === amenityId);
          if (idx === -1) {
            items.push({ id: amenityId, featured: Boolean(featured) });
          } else {
            // update featured if provided, else keep as is
            items[idx] = {
              ...items[idx],
              featured:
                typeof featured === "boolean" ? featured : items[idx].featured,
            };
          }
        } else {
          // value === "no" -> remove amenity
          items = items.filter((i) => i.id !== amenityId);
        }

        next = prev.map((c) =>
          c.category_id === categoryId ? { ...c, item: items } : c
        );
      } else if (value === "yes") {
        next = [
          ...prev,
          { category_id: categoryId, item: [{ id: amenityId, featured: Boolean(featured) }] },
        ];
      } else {
        next = prev;
      }

      return next;
    });
  }

  /** Submit add room */
  const handleAddRoom = async (_e: React.FormEvent) => {
    try {
      setSubmiting(true);

      if (!selectedAmenities.length) {
        toast.error("Please select at least one amenity.");
        setSubmiting(false);
        return;
      }

      const updatedFormData = {
        ...sharedFormData,
        room_amenities: selectedAmenities.map((cat) => ({
          category_id: cat.category_id,
          item: (cat.item || []).map((i) => ({
            id: i.id,
            featured: Boolean(i.featured),
          })),
        })),
        propertyId,
      };

      setSharedFormData(updatedFormData);

      const response = await fetch(`/api/room/add`, {
        method: "POST",
        body: JSON.stringify(updatedFormData),
      });

      const result = await response.json();

      if (result?.success) {
        toast.success("Room added successfully!");
        setSubmiting(false);
        setTimeout(() => {
          setMaxStepReached(1);
          setAddRoom(false);
        }, 800);
      } else {
        toast.error(result?.message || "Failed to add room.");
        setSubmiting(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong.");
      setSubmiting(false);
    }
  };

  /** Back -> persist current selection into sharedFormData */
  const handleBackClick = () => {
    const updatedFormData = {
      ...sharedFormData,
      room_amenities: selectedAmenities.map((cat) => ({
        category_id: cat.category_id,
        item: (cat.item || []).map((i) => ({
          id: i.id,
          featured: Boolean(i.featured),
        })),
      })),
      propertyId,
    };
    setSharedFormData(updatedFormData);
  };

  /** Helpers to query selection/featured state */
  const isAmenitySelected = (amenityId: string) =>
    selectedAmenities.some(
      (c) => c.category_id === activeCategoryId && c.item.some((i) => i.id === amenityId)
    );

  const isAmenityFeatured = (amenityId: string) =>
    selectedAmenities.some(
      (c) =>
        c.category_id === activeCategoryId &&
        c.item.some((i) => i.id === amenityId && i.featured)
    );

  return (
    <div className="p-4 w-full">
      <h3 className="mb-1">Room Amenities</h3>
      <p className="text-zinc-600">Select the amenities available at your property.</p>

      <div className="content-wrapper mt-3 p-4  bg-white">
        <div className="flex">
          {/* Left: Categories */}
          <div
            className="w-full lg:w-1/4 pr-3 border-r border-gray-200 max-h-[400px] overflow-y-auto"
          >
            <ul className="list-none p-0 m-0">
              {loading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <li key={idx} className="mb-2">
                      <Skeleton/>
                    </li>
                  ))
                : categorys.map((category) => (
                    <li key={category._id} className="mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full justify-start ${activeCategoryId === category._id ? "bg-blue-50 border-blue-500" : ""}`}
                        onClick={() => listupdateHandler(category._id)}
                      >
                        {category.title}
                      </Button>
                    </li>
                  ))}
            </ul>
          </div>

          {/* Right: Amenities */}
          <div className="lg:w-3/4 ps-3 max-h-[400px] overflow-y-auto">
            <ul className="list-none p-0 m-0">
              {loading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <li key={idx} className="py-3">
                      <Skeleton />
                    </li>
                  ))
                : amenities.map((amenity) => (
                    <li
                      key={amenity._id}
                      className="flex justify-between items-center border-b py-3"
                    >
                      <span className="font-medium">{amenity.title}</span>
                      <div
                        className="flex items-center bg-gray-100 px-3 py-2 rounded-full shadow-sm"
                        style={{ gap: "15px" }}
                      >
                        <RadioGroup
                          value={isAmenitySelected(amenity._id) ? "yes" : "no"}
                          onValueChange={(v) => inputHandler(amenity._id, activeCategoryId, v as "yes" | "no")}
                          className="flex items-center space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id={`yes-${amenity._id}`} />
                            <Label htmlFor={`yes-${amenity._id}`} className="font-medium cursor-pointer">
                              Yes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id={`no-${amenity._id}`} />
                            <Label htmlFor={`no-${amenity._id}`} className="font-medium cursor-pointer">
                              No
                            </Label>
                          </div>
                        </RadioGroup>

                        {isAmenitySelected(amenity._id) && (
                          <div className="flex items-center space-x-2 ml-4">
                            <Checkbox
                              id={`featured-${amenity._id}`}
                              checked={isAmenityFeatured(amenity._id)}
                              onCheckedChange={(checked) =>
                                inputHandler(amenity._id, activeCategoryId, "yes", checked as boolean)
                              }
                            />
                            <Label htmlFor={`featured-${amenity._id}`} className="font-medium cursor-pointer">
                              Featured
                            </Label>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="text-right mt-4 flex gap-2 justify-end">
        <Button variant="outline" size="lg" onClick={handleBackClick}>
          Back
        </Button>
        <Button disabled={submiting} size="lg" onClick={handleAddRoom}>
          Add Room {submiting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </Button>
      </div>
    </div>
  );
};

export default StepFour;