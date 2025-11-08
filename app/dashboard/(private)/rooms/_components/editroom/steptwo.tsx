
"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Bed } from "lucide-react";

const bedSchema = z.object({ type: z.string().min(1), count: z.number().min(1) });
const occupancySchema = z.object({
  baseAdults: z.number().min(1),
  maxAdults: z.number().min(1),
  maxChildren: z.number().min(0),
  maxOccupancy: z.number().min(1),
});
const formSchema = z.object({
  bedTypes: z.array(bedSchema).min(1),
  occupancy: occupancySchema,
  extraBed: z.enum(["yes", "no"]),
  alternateBed: z.enum(["yes", "no"]).optional(),
});

type BedType = z.infer<typeof bedSchema>;

export default function EditStepTwo({ id, setSharedFormData }: any) {
  const [bedTypes, setBedTypes] = useState<BedType[]>([{ type: "", count: 0 }]);
  const [occupancy, setOccupancy] = useState({ baseAdults: 0, maxAdults: 0, maxChildren: 0, maxOccupancy: 0 });
  const [extraBed, setExtraBed] = useState("no");
  const [alternateBed, setAlternateBed] = useState("no");
  const [errors, setErrors] = useState<any>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/rooms/get/${id}`);
        const { data } = await res.json();
        console.log(data,'rooms data json');
        console.log(id,'room id');
        
        if (data) {
          const prev = data || {};
          setBedTypes(prev?.bedTypes || [{ type: "", count: 0 }]);
          setOccupancy(prev?.occupancy || { baseAdults: 0, maxAdults: 0, maxChildren: 0, maxOccupancy: 0 });
          setExtraBed(prev?.extraBed || "no");
          setAlternateBed(prev?.alternateBed || "no");
          setSharedFormData((p: any) => ({ ...p, StepTwo: { bedTypes: prev?.bedTypes || [], occupancy: prev?.occupancy || {}, extraBed: prev?.extraBed || "no", alternateBed: prev?.alternateBed || "no" } }));
        }
      } catch {}
    })();
  }, [id, setSharedFormData]);

  function updateBed(index: number, field: keyof BedType, value: any) {
    const next = [...bedTypes];
    // @ts-expect-error dynamic
    next[index][field] = value;
    setBedTypes(next);
  }

  function removeBed(index: number) {
    if (bedTypes.length <= 1) return;
    setBedTypes(bedTypes.filter((_, i) => i !== index));
  }

  function validateAndSave() {
    const parsed = formSchema.safeParse({ bedTypes, occupancy, extraBed, alternateBed });
    if (!parsed.success) {
      const e: any = {};
      // @ts-ignore
      parsed.error.errors.forEach((er) => {
        const [top, idx, key] = er.path as any[];
        if (top === "bedTypes") {
          e.bedTypes = e.bedTypes || [];
          e.bedTypes[idx] = e.bedTypes[idx] || {};
          if (key) e.bedTypes[idx][key] = er.message;
        } else if (top === "occupancy") {
          e.occupancy = e.occupancy || {};
          e.occupancy[idx] = er.message;
        } else {
          e[top] = er.message;
        }
      });
      setErrors(e);
      return;
    }
    setErrors({});
    setSharedFormData((p: any) => ({ ...p, StepTwo: { bedTypes, occupancy, extraBed, alternateBed } }));
    setOpen(false);
  }

  const bedOptions = [
    { value: "king", label: "King Bed", hint: "6×6 ft" },
    { value: "queen", label: "Queen Bed", hint: "6×6 ft" },
    { value: "double", label: "Double Bed", hint: "5×6 ft" },
    { value: "single", label: "Single Bed", hint: "3×6 ft" },
    { value: "bunk", label: "Bunk Bed", hint: "Variable" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold">Sleeping Arrangement & Occupancy</h4>
        {!open && (
          <Button variant="link" className="px-0" onClick={() => setOpen(true)}>
            Edit
          </Button>
        )}
      </div>
      <div className="border-t my-3" />

      {!open ? (
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>Bed types: {bedTypes.filter(b => b.type).length}</div>
          <div>
            Occupancy: base {occupancy.baseAdults}, max adults {occupancy.maxAdults}, children {occupancy.maxChildren}, total {occupancy.maxOccupancy}
          </div>
          <div>Extra bed: {extraBed}, Alternate: {alternateBed}</div>
        </div>
      ) : (
        <div className="space-y-6">
          <Separator />
          <h6 className="text-lg font-semibold">Standard Arrangement</h6>
          {bedTypes.map((bed, i) => (
            <div key={i} className="flex flex-col md:flex-row items-start gap-3">
              <div className="md:w-3/12 text-sm text-muted-foreground">Select bed type</div>
              <div className="md:w-4/12">
                <Label className="mb-1 block">Bed Type {i + 1}</Label>
                <Select value={bed.type} onValueChange={(v) => updateBed(i, "type", v)}>
                  <SelectTrigger className="min-h-12">
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bedOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4" />
                          <div>
                            <div>{o.label}</div>
                            <div className="text-xs text-muted-foreground">{o.hint}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors?.bedTypes?.[i]?.type && (
                  <p className="text-destructive text-xs mt-1">{errors.bedTypes[i].type}</p>
                )}
              </div>
              <div className="md:w-3/12">
                <Label className="mb-1 block">Number of beds</Label>
                <div className="flex gap-2 items-center">
                  <Button variant="outline" size="sm" onClick={() => updateBed(i, "count", Math.max(0, (bed.count || 0) - 1))}>-</Button>
                  <Input className="text-center h-10 flex-1" readOnly value={bed.count} />
                  <Button variant="outline" size="sm" onClick={() => updateBed(i, "count", (bed.count || 0) + 1)}>+</Button>
                </div>
                {errors?.bedTypes?.[i]?.count && (
                  <p className="text-destructive text-xs mt-1">{errors.bedTypes[i].count}</p>
                )}
              </div>
              {bedTypes.length > 1 && (
                <div className="md:w-2/12">
                  <Button variant="destructive" className="mt-6" onClick={() => removeBed(i)}>Remove</Button>
                </div>
              )}
            </div>
          ))}
          {bedTypes.length < 4 ? (
            <Button variant="link" onClick={() => setBedTypes([...bedTypes, { type: "", count: 0 }])}>
              Add Another Bed Type
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Maximum 4 bed types allowed.</p>
          )}

          <div className="mt-4 flex items-center gap-6">
            <Label className="w-1/2">Can this room accommodate extra bed(s)?</Label>
            <RadioGroup value={extraBed} onValueChange={setExtraBed} className="flex items-center gap-6 w-1/2">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="extra-no" value="no" />
                <Label htmlFor="extra-no">No</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="extra-yes" value="yes" />
                <Label htmlFor="extra-yes">Yes</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />
          <h6 className="text-lg font-semibold">Alternative Sleeping Arrangement <span className="text-sm text-muted-foreground">(Optional)</span></h6>
          <div className="flex items-center gap-6">
            <Label className="w-1/2">Does this room offer an alternate sleeping arrangement?</Label>
            <RadioGroup value={alternateBed} onValueChange={setAlternateBed} className="flex items-center gap-6 w-1/2">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="alt-no" value="no" />
                <Label htmlFor="alt-no">No</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="alt-yes" value="yes" />
                <Label htmlFor="alt-yes">Yes</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />
          <h6 className="text-lg font-semibold">Occupancy</h6>
          <p className="text-sm text-muted-foreground">Occupancy details have been pre-filled based on the selected bed arrangement above</p>

          {([
            { label: "Base adults", key: "baseAdults", desc: "Minimum number of adults supported by the standard sleeping arrangement." },
            { label: "Maximum adults", key: "maxAdults", desc: "Maximum number of adults that can be accommodated in this room." },
            { label: "Maximum children", key: "maxChildren", desc: "Maximum number of children that can be accommodated in this room." },
            { label: "Maximum occupancy", key: "maxOccupancy", desc: "Maximum number of guests that can be accommodated in this room." },
          ] as const).map(({ label, key, desc }) => (
            <div key={key} className="flex flex-col md:flex-row items-start gap-3">
              <div className="md:w-5/12">
                <h6 className="font-medium">{label}</h6>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <div className="md:w-4/12">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOccupancy((p: any) => ({ ...p, [key]: Math.max(0, Number(p[key]) - 1) }))}>-</Button>
                  <Input readOnly className="text-center" value={occupancy[key as keyof typeof occupancy]} />
                  <Button variant="outline" size="sm" onClick={() => setOccupancy((p: any) => ({ ...p, [key]: Number(p[key]) + 1 }))}>+</Button>
                </div>
                {errors?.occupancy?.[key] && (
                  <p className="text-destructive text-xs mt-1">{errors.occupancy[key]}</p>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={validateAndSave}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}
