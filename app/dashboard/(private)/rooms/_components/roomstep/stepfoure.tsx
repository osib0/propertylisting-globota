"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

const StepFour = ({
  setAddRoom,
  setMaxStepReached,
  propertyId,
  sharedFormData,
  setSharedFormData,
  userId
}: any) => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [categorys, setCategorys] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [selectedAmenities, setSelectedAmenities] = useState<SelectedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submiting, setSubmiting] = useState<boolean>(false);

  /** Fetch amenities for a specific category */
  const fetchAmenities = async (id: string) => {
    try {
      const response = await fetch(`/api/roomamenities/fromCategory?categoryId=${id}`);
      if (!response.ok) throw new Error("Failed to fetch amenities");
      const result = await response.json();
      setAmenities(result?.data || []);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast.error("Failed to load amenities.");
    }
  };

  /** Fetch saved amenities for the room */
  const fetchSavedAmenities = async () => {
    try {
      const response = await fetch(`/api/rooms/get/${propertyId}`, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch saved amenities");
      const result = await response.json();

      const saved: SelectedCategory[] = (result?.data?.room_amenities || []).map((cat: any) => ({
        category_id: String(cat?.category_id || ""),
        item: Array.isArray(cat?.item)
          ? cat.item
            .filter(Boolean)
            .map((x: any) => ({
              id: String(x?.id ?? x?._id ?? ""),
              featured: Boolean(x?.featured),
            }))
            .filter((x: AmenityItem) => x.id)
          : [],
      }));

      setSelectedAmenities(saved);
    } catch (err) {
      console.error("Error fetching saved amenities:", err);
      toast.error("Failed to load saved amenities.");
    }
  };

  /** Initialize categories */
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

  /** Handle selection + featured */
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
        let items = [...existing.item];

        if (value === "yes") {
          const idx = items.findIndex((i) => i.id === amenityId);
          if (idx === -1) items.push({ id: amenityId, featured: Boolean(featured) });
          else if (typeof featured === "boolean") items[idx].featured = featured;
        } else {
          items = items.filter((i) => i.id !== amenityId);
        }

        next = prev.map((c) =>
          c.category_id === categoryId ? { ...c, item: items } : c
        );
      } else if (value === "yes") {
        next = [...prev, { category_id: categoryId, item: [{ id: amenityId, featured: Boolean(featured) }] }];
      } else {
        next = prev;
      }

      return next;
    });
  }

  /** Submit add room */
  // const handleAddRoom = async (e: React.FormEvent) => {
  //   try {
  //     setSubmiting(true);

  //     if (!selectedAmenities.length) {
  //       toast.error("Please select at least one amenity.");
  //       setSubmiting(false);
  //       return;
  //     }

  //     const updatedFormData = {
  //       ...sharedFormData,
  //       room_amenities: selectedAmenities.map((cat) => ({
  //         category_id: cat.category_id,
  //         item: (cat.item || []).map((i) => ({
  //           id: i.id,
  //           featured: Boolean(i.featured),
  //         })),
  //       })),
  //       propertyId,
  //     };

  //     setSharedFormData(updatedFormData);

  //     const response = await fetch(`/api/room/add`, {
  //       method: "POST",
  //       body: JSON.stringify(updatedFormData),
  //     });

  //     const result = await response.json();

  //     if (result?.success) {
  //       toast.success("Room added successfully!");
  //       setSubmiting(false);
  //       setTimeout(() => {
  //         setMaxStepReached(1);
  //         setAddRoom(false);
  //       }, 800);
  //     } else {
  //       toast.error(result?.message || "Failed to add room.");
  //       setSubmiting(false);
  //     }
  //   } catch (error) {
  //     console.error("Submission error:", error);
  //     toast.error("Something went wrong.");
  //     setSubmiting(false);
  //   }
  //     console.log(sharedFormData, "data");

  // };

  /** Back */
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

  /** Helpers */
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



  const handleAddRoom = async (e: React.FormEvent) => {
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
       console.log(sharedFormData, "data");
    console.log(updatedFormData, "update");

      const response = await fetch(`/api/history/room/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          userId,
           newData: updatedFormData,
        }),
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
        console.log(result);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong.");
      setSubmiting(false);
      console.log(error);

    }
   
  };



  return (
    <div className="">
      <h3 className="text-2xl font-semibold mb-1">Room Amenities</h3>
      <p className="text-sm text-zinc-600">
        Select the amenities available at your property.
      </p>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-3 max-h-[420px] overflow-y-auto">
          <div className="space-y-2">

            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center w-full gap-2 p-2 rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm animate-pulse"
                  >
                    <Skeleton className="h-5 w-2xl rounded-md" />
                  </div>
                ))}
              </>

            ) : (
              categorys.map((cat) => (
                <Button
                  key={cat._id}
                  onClick={() => listupdateHandler(cat._id)}
                  variant={"outline"}
                  className={`w-full rounded-xl cursor-pointer ${activeCategoryId === cat._id ? 'border-blue-700 shadow-2xl' : ''}`}

                >
                  {cat.title}
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Right: Amenities */}
        <div className="col-span-9 max-h-[420px] overflow-y-auto">
          <ul className="space-y-2">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm animate-pulse"
                >
                  <Skeleton className="h-5 w-1/3 rounded-md" />
                  <div className="flex gap-4">
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
                </li>
              ))
              : amenities.map((amenity) => (
                <li
                  key={amenity._id}
                  className="flex items-center justify-between p-3 border bg-white rounded-xl shadow-lg"
                >
                  <div className="font-medium">{amenity.title}</div>

                  <div className="flex items-center gap-6 bg-zinc-50 px-4 py-2 rounded-full">
                    <RadioGroup
                      value={isAmenitySelected(amenity._id) ? "yes" : "no"}
                      onValueChange={(v) =>
                        inputHandler(amenity._id, activeCategoryId, v as "yes" | "no")
                      }
                      className="flex items-center gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`yes-${amenity._id}`} />
                        <Label htmlFor={`yes-${amenity._id}`} className="text-sm font-medium">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`no-${amenity._id}`} />
                        <Label htmlFor={`no-${amenity._id}`} className="text-sm font-medium">
                          No
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="flex items-center space-x-2 ml-4">
                      <Checkbox
                        id={`featured-${amenity._id}`}
                        checked={isAmenityFeatured(amenity._id)}
                        disabled={!isAmenitySelected(amenity._id)}
                        onCheckedChange={(checked) =>
                          inputHandler(amenity._id, activeCategoryId, "yes", checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`featured-${amenity._id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        Featured
                      </Label>
                    </div>

                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <Button variant="ghost" size="lg" onClick={handleBackClick}>
          Back
        </Button>
        <Button
          disabled={submiting}
          size="lg"
          onClick={handleAddRoom}
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2"
        >
          {submiting ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" /> Saving...
            </>
          ) : (
            <>Add Room</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepFour;
