"use client";

import { useEffect, useState, FormEvent } from "react";
import { z } from "zod";
import { toast } from "react-hot-toast";
// import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const roomCategorySchema = z.object({
  room_type: z.string().min(1, "Room type is required"),
  room_view: z.string().min(1, "Room view is required"),
  room_area: z.string().min(1, "Room size is required"),
  room_name: z.string().min(1, "Room name is required"),
  room_quantity: z.number().min(1, "Room quantity is required"),
  description: z.string().optional(),
});

export type RoomCategoryForm = z.infer<typeof roomCategorySchema>;

export default function EditStepOne({ id, setSharedFormData }: any) {
  const [roomTypes, setRoomTypes] = useState<{ value: string; label: string }[]>([]);
  const [roomViews, setRoomViews] = useState<{ value: string; label: string }[]>([]);
  const [unit, setUnit] = useState("sqft");
  const [errors, setErrors] = useState<Partial<Record<keyof RoomCategoryForm, string>>>({});
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<RoomCategoryForm>({
    room_type: "",
    room_view: "",
    room_area: "",
    room_name: "",
    room_quantity: 1,
    description: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [roomTypeRes, roomViewRes, roomDetailsRes] = await Promise.all([
          fetch("/api/roomtype/get"),
          fetch("/api/roomview/get"),
          fetch(`/api/rooms/get/${id}`),
        ]);
        const [roomTypeData, roomViewData, roomDetails] = await Promise.all([
          roomTypeRes.json(),
          roomViewRes.json(),
          roomDetailsRes.json(),
        ]);

        setRoomTypes((roomTypeData?.data || []).map((item: any) => ({ value: item.title, label: item.title })));
        setRoomViews((roomViewData?.data || []).map((item: any) => ({ value: item.title, label: item.title })));

        const r = roomDetails?.data;
        console.log(r,'roms data');
        
        if (r) {
          setFormData({
            room_type: r.room_type || "",
            room_view: r.room_view || "",
            room_area: r.room_area || "",
            room_name: r.room_name || "",
            room_quantity: r.room_quantity || 1,
            description: r.description || "",
          });
          setUnit(r.unit || "sqft");
          setSharedFormData((prev: any) => ({
            ...prev,
            stepOne: { ...r, room_quantity: r.room_quantity || 1, unit: r.unit || "sqft" },
          }));
        }
      } catch (err) {
        toast.error("Failed to load form data");
        console.error(err);
      }
    }
    fetchData();
  }, [id, setSharedFormData]);

  function onChange<K extends keyof RoomCategoryForm>(key: K, val: RoomCategoryForm[K]) {
    const updated = { ...formData, [key]: val } as RoomCategoryForm;
    setFormData(updated);
    setErrors((p) => ({ ...p, [key]: "" }));
    setSharedFormData((prev: any) => ({ ...prev, stepOne: { ...updated, unit } }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = roomCategorySchema.safeParse(formData);
    if (!res.success) {
      const errs: any = {};
      // @ts-ignore
      res.error.errors.forEach((er) => (errs[er.path[0] as string] = er.message));
      setErrors(errs);
      return;
    }
    setOpen(false);
    toast.success("Room details updated");
    setSharedFormData((prev: any) => ({ ...prev, stepOne: { ...formData, unit } }));
  }

  const displayDescription = formData.description
    ? formData.description.length > 200
      ? formData.description.slice(0, 200) + "..."
      : formData.description
    : "No description provided.";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold">Room Details</h4>
        {!open && (
          <Button variant="link" className="px-0" onClick={() => setOpen(true)}>
            Edit
          </Button>
        )}
      </div>
      <div className="border-t my-3" />

      {!open ? (
        <div className="px-1 py-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-muted-foreground text-[12px] font-semibold">
                Room Name as shown on Royal Jaisalmer.Travle
                & its partner websites
              </div>
              <div className="font-semibold">{formData.room_name}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[12px] font-semibold">{formData.room_view||'no view available'}</div>
              <div className="font-semibold">Garden View</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[12px] font-semibold">
                Number of rooms (of this type)
              </div>
              <div className="font-semibold">{formData.room_quantity}</div>
            </div>
            <div>
              <div className="font-semibold">
                {formData.room_area} {unit === "sqft" ? "Square Feet" : "Square Meter"}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-muted-foreground text-[12px] font-semibold">Description of the room</div>
            <div className="font-semibold">{displayDescription}</div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Room type */}
          <div className="grid md:grid-cols-2 gap-3 items-start">
            <div>
              <div className="font-medium">Room type</div>
              <p className="text-sm text-muted-foreground">Choose the type that best describes this room</p>
            </div>
            <div>
              <Select value={formData.room_type} onValueChange={(v) => onChange("room_type", v)}>
                <SelectTrigger>
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
              {errors.room_type && <p className="text-destructive text-sm mt-1">{errors.room_type}</p>}
            </div>
          </div>

          {/* Room view */}
          <div className="grid md:grid-cols-2 gap-3 items-start">
            <div>
              <div className="font-medium">Room view</div>
              <p className="text-sm text-muted-foreground">Describe what the guest will see from this room</p>
            </div>
            <div>
              <Select value={formData.room_view} onValueChange={(v) => onChange("room_view", v)}>
                <SelectTrigger>
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
              {errors.room_view && <p className="text-destructive text-sm mt-1">{errors.room_view}</p>}
            </div>
          </div>

          {/* Room area */}
          <div className="grid md:grid-cols-2 gap-3 items-start">
            <div>
              <div className="font-medium">Room Size (Area)</div>
              <p className="text-sm text-muted-foreground">Specify the indoor area of the room in square units</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="radio"
                    name="unit"
                    className="h-4 w-4"
                    checked={unit === "sqft"}
                    onChange={() => setUnit("sqft")}
                  />
                  Square Feet
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="radio"
                    name="unit"
                    className="h-4 w-4"
                    checked={unit === "sqm"}
                    onChange={() => setUnit("sqm")}
                  />
                  Square Meter
                </label>
              </div>
              <div className="flex-1">
                <Input value={formData.room_area} onChange={(e) => onChange("room_area", e.target.value)} />
                {errors.room_area && <p className="text-destructive text-sm mt-1">{errors.room_area}</p>}
              </div>
            </div>
          </div>

          {/* Room name */}
          <div className="grid md:grid-cols-2 gap-3 items-start">
            <div>
              <div className="font-medium">Room Name</div>
              <p className="text-sm text-muted-foreground">Add a room name that looks attractive to travellers</p>
            </div>
            <div>
              <Input value={formData.room_name} onChange={(e) => onChange("room_name", e.target.value)} />
              {errors.room_name && <p className="text-destructive text-sm mt-1">{errors.room_name}</p>}
            </div>
          </div>

          {/* Room quantity */}
          <div className="grid md:grid-cols-2 gap-3 items-start">
            <div>
              <div className="font-medium">Number of rooms</div>
              <p className="text-sm text-muted-foreground">Specify how many rooms of this type are at your property</p>
            </div>
            <div>
              <Input
                type="number"
                min={1}
                value={formData.room_quantity}
                onChange={(e) => onChange("room_quantity", Math.max(1, Number(e.target.value || 0)))}
              />
              {errors.room_quantity && <p className="text-destructive text-sm mt-1">{errors.room_quantity}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="grid md:grid-cols-2 gap-3 items-start">
            <div>
              <div className="font-medium">Description</div>
              <p className="text-sm text-muted-foreground">Highlight what makes this room appealing — view, comfort, features.</p>
            </div>
            <div>
              <Textarea rows={3} value={formData.description} onChange={(e) => onChange("description", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      )}
    </div>
  );
}