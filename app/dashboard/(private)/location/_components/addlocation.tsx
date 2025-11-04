"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, Check } from "lucide-react";

interface City {
  _id: string;
  title: string;
}

interface DistanceItem {
  id?: string;
  city: string;
  distance: string;
  isEditing?: boolean;
}

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 mr-2"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    ></path>
  </svg>
);

export default function LocationAdd({
  propertyId,
  userId
}: {
  propertyId: string | null;
  userId: string | undefined
}) {
  const [cities, setCities] = useState<City[]>([]);
  const [distances, setDistances] = useState<DistanceItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/nearbylocation/get");
      const json = await res.json();
      const sorted = (json.data || []).sort((a: City, b: City) =>
        a.title.localeCompare(b.title)
      );
      setCities(sorted);
    } catch (err) {
      console.error("fetchCities error", err);
      toast.error("Failed to load cities");
    }
  };

  const fetchPropertyDistances = async () => {
    if (!propertyId) return;
    try {
      const res = await fetch(`/api/property/get?propertyId=${propertyId}`);
      const json = await res.json();
      const property = json.data;
      if (property) {
        const formatted: DistanceItem[] = (property.distance_from || []).map(
          (it: any, i: number) => ({
            id: it._id ? String(it._id) : String(i),
            city: it.city || "",
            distance: it.distance || "",
            isEditing: false,
          })
        );
        setDistances(formatted);
      }
    } catch (err) {
      console.error("fetchPropertyDistances error", err);
      toast.error("Failed to load property distances");
    }
  };

  useEffect(() => {
    fetchCities();
    fetchPropertyDistances();
  }, [propertyId]);

  const handleChange = (
    index: number,
    field: keyof DistanceItem,
    value: string
  ) => {
    setDistances((prev) => {
      const copy = [...prev];
      (copy[index] as any)[field] = value;
      return copy;
    });
  };

  const handleAdd = () => {
    setDistances((prev) => [
      { city: "", distance: "", isEditing: true },
      ...prev,
    ]);
  };

  const handleRemove = (index: number) => {
    setDistances((prev) => prev.filter((_, i) => i !== index));
  };


  const toggleEdit = (index: number) => {
    setDistances((prev) => {
      const copy = [...prev];

      if (copy[index].isEditing) {
        const current = copy[index];
        if (!current.city.trim() || !current.distance.trim()) {
          toast.error("Please fill both city and distance before saving");
          return prev;
        }
      }

      // Toggle the isEditing value
      copy[index] = { ...copy[index], isEditing: !copy[index].isEditing };
      return copy;
    });
  };



  // const handleSaveAll = async () => {
  //   if (!propertyId) return toast.error("Property ID not found");

  //   const invalid = distances.some(
  //     (d) => !d.city.trim() || !d.distance.trim()
  //   );
  //   if (invalid) return toast.error("Please fill all city and distance fields");

  //   setLoading(true);
  //   try {
  //     const res = await fetch(`/api/property/update/${propertyId}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(distances.map(({ city, distance }) => ({
  //         city,
  //         distance,
  //       })),),
  //     });
  //     const json = await res.json();
  //     console.log(json, 'json');
  //     console.log(distances.map(({ city, distance }) => ({
  //       city,
  //       distance,
  //     })))

  //     if (json.status) {
  //       toast.success("Updated successfully");
  //       fetchPropertyDistances();
  //     } else {
  //       toast.error(json.message || "Update failed");
  //     }
  //   } catch (err) {
  //     console.error("handleSaveAll error", err);
  //     toast.error("Update failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleSaveAll = async () => {
  if (!propertyId) return toast.error("Property ID not found");

  const invalid = distances.some((d) => !d.city.trim() || !d.distance.trim());
  if (invalid) return toast.error("Please fill all city and distance fields");

  setLoading(true);
  try {
    const res = await fetch(`/api/history/location/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        userId,
        newDistances: distances.map(({ city, distance }) => ({
          city,
          distance,
        })),
      }),
    });

    const json = await res.json();
    console.log("distance history response", json);

    if (json.status) {
      toast.success(json.message || "Distance changes submitted for approval");
      fetchPropertyDistances(); // Refresh list
    } else {
      toast.error(json.message || "Failed to submit distance changes");
    }
  } catch (err) {
    console.error("handleSaveAll error", err);
    toast.error("Failed to submit distance changes");
  } finally {
    setLoading(false);
  }
};


  return (
    <Card className="mt-6 border shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>Distance From</CardTitle>
          <Button variant="secondary" onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add More
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {distances.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No distances added yet.
            </p>
          )}

          {distances.map((item, index) => (
            <div
              key={item.id ?? index}
              className="grid grid-cols-1 md:grid-cols-8 gap-3 items-end border-b pb-3"
            >
              <div className="md:col-span-3 w-full">
                <div className="md:col-span-3 w-full">
                  <Label className="mb-2">Location</Label>
                  <Select
                    disabled={!item.isEditing}
                    value={item.city}

                    onValueChange={(value) => handleChange(index, "city", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c._id} value={c.title}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="md:col-span-3">
                <Label className="mb-2">Distance (km)</Label>
                <Input
                  value={item.distance}
                  onChange={(e) => handleChange(index, "distance", e.target.value)}
                  disabled={!item.isEditing}
                  readOnly={!item.isEditing}
                  placeholder="e.g. 12 km"
                />

              </div>


              <div className="flex gap-2 md:col-span-2">
                <Button
                  variant="destructive"
                  onClick={() => handleRemove(index)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>

                <Button
                  onClick={() => toggleEdit(index)}
                  className={`flex items-center gap-2 ${item.isEditing ? "bg-black text-white" : ""}`}
                >
                  {item.isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  {item.isEditing ? "Save" : "Edit"}
                </Button>

              </div>
            </div>
          ))}
        </div>

        {distances.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveAll} disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <Spinner /> Saving...
                </div>
              ) : (
                "Update All Changes"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
