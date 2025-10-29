// components/propertymanagement/property/manageinventory/bulkupdate/BulkUpdate.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { User } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { CheckedState } from "@radix-ui/react-checkbox";

type BulkMode = "inventory" | "rates";

type Props = {
  mode: BulkMode;
  type: "b2c" | "b2b";
  propertyId: string;
  onClose: () => void;
  fetchRates: (signal?: AbortSignal) => Promise<any> | any;
  fetchInventory: (signal?: AbortSignal) => Promise<any> | any;
};

type Room = {
  _id: string;
  room_name?: string;
  base_occupancy?: number;
  ratePlans?: { _id: string; rateplan_name: string }[];
};

type RoomRate = {
  base_rate?: number;
  extra_rate?: number;
  paid_child_rate?: number;
  extra_adult_charge?: number;
};

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const BulkUpdate: React.FC<Props> = ({ mode, type, propertyId, onClose, fetchRates, fetchInventory }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const [saving, setSaving] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());

  const [roomInventory, setRoomInventory] = useState<Record<string, number>>({});
  const [roomRates, setRoomRates] = useState<Record<string, RoomRate>>({});
  const [showNettRate, setShowNettRate] = useState<CheckedState>(false);
  const [updateExtraGuestPrice, setUpdateExtraGuestPrice] = useState<CheckedState>(false);

  const allSelected = useMemo(() => rooms.length > 0 && selectedRooms.size === rooms.length, [rooms.length, selectedRooms.size]);

  useEffect(() => {
    let abort = new AbortController();
    (async () => {
      try {
        setLoadingRooms(true);
        const res = await fetch(`/api/room/roomlist/${propertyId}`, { signal: abort.signal });
        const json = await res.json();
        if (!json?.success) throw new Error(json?.error || "Failed to load rooms");
        const list: Room[] = (json.data || []).map((x: any) => ({
          _id: x._id,
          room_name: x.room_name,
          base_occupancy: x.base_occupancy,
          ratePlans: x.ratePlans || [],
        }));
        setRooms(list);

        setSelectedRooms(new Set(list.map((r) => r._id)));

        if (mode === "inventory") {
          const seed: Record<string, number> = {};
          list.forEach((r) => (seed[r._id] = 0));
          setRoomInventory(seed);
        } else if (mode === "rates") {
          setRoomRates({});
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") toast.error(e?.message || "Failed to load rooms");
      } finally {
        setLoadingRooms(false);
      }
    })();
    return () => abort.abort();
  }, [propertyId, mode]);

  const toggleDay = (index: number) => {
    setSelectedDays((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedRooms((prev) => {
      if (rooms.length === 0) return new Set();
      if (prev.size === rooms.length) return new Set();
      return new Set(rooms.map((r) => r._id));
    });
  };

  const generateDateRange = (start: Date, end: Date): string[] => {
    const out: string[] = [];
    const cur = new Date(start);
    cur.setHours(0, 0, 0, 0);
    const fin = new Date(end);
    fin.setHours(0, 0, 0, 0);

    while (cur <= fin) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      out.push(`${y}-${m}-${d}`);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  };

  const canSave = useMemo(() => {
    const start = date?.from;
    const end = date?.to;
    if (!start || !end || selectedDays.length === 0 || selectedRooms.size === 0) return false;
    if (mode === "rates") {
      return Object.keys(roomRates).length > 0;
    }
    return true;
  }, [date, selectedDays, selectedRooms.size, mode, roomRates]);

  const handleInventoryChange = (roomId: string, val: string) => {
    const n = Math.max(0, parseInt(val || "0", 10) || 0);
    setRoomInventory((prev) => ({ ...prev, [roomId]: n }));
  };

  const handleRateChange = (roomId: string, planId: string, field: keyof RoomRate, val: string) => {
    const key = `${roomId}_${planId}`;
    setRoomRates((prev) => {
      const current = prev[key] || {};
      let nextFieldValue: number | undefined;

      if (val === "" || val === null) {
        nextFieldValue = undefined;
      } else {
        const parsed = Math.max(0, parseInt(val, 10) || 0);
        nextFieldValue = parsed;
      }

      const nextForKey: RoomRate = { ...current, [field]: nextFieldValue };

      const cleaned: RoomRate = {};
      (["base_rate", "extra_rate", "paid_child_rate", "extra_adult_charge"] as (keyof RoomRate)[]).forEach((k) => {
        const v = nextForKey[k];
        if (v !== undefined) cleaned[k] = v;
      });

      const next: Record<string, RoomRate> = { ...prev };
      if (Object.keys(cleaned).length === 0) {
        delete next[key];
      } else {
        next[key] = cleaned;
      }
      return next;
    });
  };

  const handleSave = async () => {
    const start = date?.from;
    const end = date?.to;
    if (!start || !end || selectedDays.length === 0 || selectedRooms.size === 0) {
      toast.error("Please select date range, weekdays, and rooms");
      return;
    }

    const days = generateDateRange(start, end);
    const activeRooms = rooms.filter((r) => selectedRooms.has(r._id));

    try {
      setSaving(true);

      if (mode === "inventory") {
        const inventory = activeRooms.flatMap((room) => {
          const count = roomInventory[room._id] ?? 0;
          return days.flatMap((date) => {
            const jsDay = new Date(date).getDay();
            if (selectedDays.includes(jsDay)) {
              return [
                {
                  room_id: room._id,
                  property_id: propertyId,
                  date,
                  available_rooms: count,
                  status: "unblock" as const,
                  type,
                },
              ];
            }
            return [];
          });
        });

        if (inventory.length === 0) {
          toast.error("No matching dates with selected weekdays.");
          return;
        }

        const res = await fetch("/api/roominventory/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inventory }),
        });
        const json = await res.json();
        if (!json?.success) throw new Error(json?.error || "Failed to update inventory");

        toast.success("Inventory updated successfully");
        await fetchInventory();
      }

      if (mode === "rates") {
        const rates = activeRooms.flatMap((room) => {
          const baseOcc = room.base_occupancy || 2;
          return (room.ratePlans || []).flatMap((plan) => {
            const key = `${room._id}_${plan._id}`;
            const rr = roomRates[key] || {};

            return days.flatMap((date) => {
              const jsDay = new Date(date).getDay();
              if (!selectedDays.includes(jsDay)) return [];

              const fieldsToConsider: (keyof RoomRate)[] = ["base_rate", "extra_rate"];
              if (updateExtraGuestPrice) {
                fieldsToConsider.push("paid_child_rate", "extra_adult_charge");
              }

              const typedFields: Partial<RoomRate> = {};
              fieldsToConsider.forEach((f) => {
                const v = rr[f];
                if (v !== undefined) typedFields[f] = v;
              });

              if (Object.keys(typedFields).length === 0) return [];

              const record: any = {
                room_id: room._id,
                rateplan_id: plan._id,
                property_id: propertyId,
                date,
                type,
                occupancy: baseOcc,
                ...typedFields,
              };

              return [record];
            });
          });
        });

        if (rates.length === 0) {
          toast.error("No rates entered for the selected days/rooms.");
          return;
        }

        const res = await fetch("/api/roomrates/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rates }),
        });
        const json = await res.json();
        if (!json?.success) throw new Error(json?.error || "Failed to update rates");

        toast.success("Rates updated successfully");
        await fetchRates();
      }

      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg font-semibold">Bulk Update — {mode.charAt(0).toUpperCase() + mode.slice(1)}</h5>
          <Badge variant="secondary" className="text-xs">{type.toUpperCase()}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave || saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 bg-muted/50 p-4 rounded-lg">
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase">Select dates *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "PPP")} - {format(date.to, "PPP")}
                    </>
                  ) : (
                    format(date.from, "PPP")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar initialFocus mode="range" selected={date} onSelect={setDate} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase">Select weekdays</Label>
          <div className="flex gap-1">
            {DAYS.map((d, i) => (
              <Button
                key={i}
                variant={selectedDays.includes(i) ? "default" : "outline"}
                className="h-10 w-10 rounded"
                onClick={() => toggleDay(i)}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>

        {mode === "rates" && (
          <div className="space-y-2">
            <Checkbox checked={showNettRate} onCheckedChange={setShowNettRate}>
              <Label className="text-sm font-medium ml-2">Show Nett Rate (20% commission)</Label>
            </Checkbox>
            <Checkbox checked={updateExtraGuestPrice} onCheckedChange={setUpdateExtraGuestPrice}>
              <Label className="text-sm font-medium ml-2">Update Extra Guest Price</Label>
            </Checkbox>
          </div>
        )}
      </div>

      {mode === "inventory" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Set Available Rooms (per room)</CardTitle>
              <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll}>
                <Label className="text-sm font-medium ml-2">Select all</Label>
              </Checkbox>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {loadingRooms ? (
                <div className="text-sm text-muted-foreground col-span-full">Loading rooms…</div>
              ) : rooms.length === 0 ? (
                <div className="text-sm text-muted-foreground col-span-full">No rooms found.</div>
              ) : (
                rooms.map((room) => {
                  const checked = selectedRooms.has(room._id);
                  return (
                    <div key={room._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold uppercase">{room.room_name || "Room"}</Label>
                        <Checkbox checked={checked} onCheckedChange={() => toggleRoomSelection(room._id)} />
                      </div>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Enter available rooms"
                        value={roomInventory[room._id] ?? ""}
                        onChange={(e) => handleInventoryChange(room._id, e.target.value)}
                        disabled={!checked}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Set Rates (per room & rateplan)</CardTitle>
              <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll}>
                <Label className="text-sm font-medium ml-2">Select all</Label>
              </Checkbox>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {rooms.map((room, idx) => {
                const roomChecked = selectedRooms.has(room._id);
                return (
                  <AccordionItem key={room._id} value={String(idx)} className="border rounded-md mb-2">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={roomChecked} onCheckedChange={() => toggleRoomSelection(room._id)} />
                        <div>
                          <div className="text-sm font-medium">{room.room_name || `Room ${idx + 1}`}</div>
                          <div className="text-xs text-muted-foreground">Base Occupancy: {room.base_occupancy || 2}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {(room.ratePlans || []).map((plan) => {
                        const key = `${room._id}_${plan._id}`;
                        const rate = roomRates[key] || {};
                        const baseOcc = room.base_occupancy || 2;

                        return (
                          <div key={plan._id} className="space-y-4 mb-6">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm">{plan.rateplan_name}</h5>
                              {showNettRate && <Badge variant="secondary" className="text-xs">(Commission @ 20%)</Badge>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center p-2 border rounded">
                                  <div className="flex items-center">
                                    <span className="text-lg font-bold mr-1">{baseOcc}</span>
                                    <User className="h-4 w-4" />
                                  </div>
                                  <span className="text-xs">Base Rate</span>
                                </div>
                                <div className="flex-1">
                                  <Input
                                    type="number"
                                    placeholder="₹ Enter"
                                    min={0}
                                    value={rate.base_rate ?? ""}
                                    onChange={(e) => handleRateChange(room._id, plan._id, "base_rate", e.target.value)}
                                    disabled={!roomChecked}
                                  />
                                  {showNettRate && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Nett: ₹{((rate.base_rate ?? 0) * 0.8).toFixed(0)}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center p-2 border rounded">
                                  <div className="flex items-center">
                                    <span className="text-lg font-bold mr-1">+1</span>
                                    <User className="h-4 w-4" />
                                  </div>
                                  <span className="text-xs">Extra Rate</span>
                                </div>
                                <div className="flex-1">
                                  <Input
                                    type="number"
                                    placeholder="₹ Enter"
                                    min={0}
                                    value={rate.extra_rate ?? ""}
                                    onChange={(e) => handleRateChange(room._id, plan._id, "extra_rate", e.target.value)}
                                    disabled={!roomChecked}
                                  />
                                  {showNettRate && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Nett: ₹{((rate.extra_rate ?? 0) * 0.8).toFixed(0)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {updateExtraGuestPrice && (
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Paid Child Rate (7 - 12 years)</Label>
                                  <Input
                                    type="number"
                                    placeholder="₹ Enter"
                                    min={0}
                                    value={rate.paid_child_rate ?? ""}
                                    onChange={(e) => handleRateChange(room._id, plan._id, "paid_child_rate", e.target.value)}
                                    disabled={!roomChecked}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Extra Adult Charge (13+)</Label>
                                  <Input
                                    type="number"
                                    placeholder="₹ Enter"
                                    min={0}
                                    value={rate.extra_adult_charge ?? ""}
                                    onChange={(e) => handleRateChange(room._id, plan._id, "extra_adult_charge", e.target.value)}
                                    disabled={!roomChecked}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkUpdate;