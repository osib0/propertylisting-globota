"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

type Props = {
  type: "b2c" | "b2b";
  propertyId: string;
  onClose: () => void;
  onSaved?: () => void;
};

type Room = {
  _id: string;
  room_name?: string;
};

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const RestrictionUpdate: React.FC<Props> = ({ type, propertyId, onClose, onSaved }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  const [saving, setSaving] = useState(false);

  const selectedDaysCount = selectedDays.length;

  useEffect(() => {
    let abort = new AbortController();
    (async () => {
      try {
        setLoadingRooms(true);
        const res = await fetch(`/api/room/roomlist/${propertyId}`, { signal: abort.signal });
        const json = await res.json();
        if (!json?.success) throw new Error(json?.error || "Failed to load rooms");
        setRooms(json.data || []);
      } catch (e: any) {
        if (e?.name !== "AbortError") toast.error(e?.message || "Failed to load rooms");
      } finally {
        setLoadingRooms(false);
      }
    })();
    return () => abort.abort();
  }, [propertyId]);

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
    return !!start && !!end && !!selectedRoomId && selectedDays.length > 0;
  }, [date, selectedRoomId, selectedDays]);

  const handleSave = async () => {
    const start = date?.from;
    const end = date?.to;
    if (!start || !end) {
      toast.error("Please select a date range");
      return;
    }
    if (!selectedRoomId) {
      toast.error("Please select one room to block");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Please select at least one weekday");
      return;
    }

    const days = generateDateRange(start, end);
    const payload = days.flatMap((dateStr) => {
      const dayIndex = new Date(dateStr).getDay();
      const ourIndex = (dayIndex + 6) % 7;
      if (selectedDays.includes(ourIndex)) {
        return [
          {
            room_id: selectedRoomId,
            property_id: propertyId,
            date: dateStr,
            available_rooms: 0,
            status: "block" as const,
            type,
          },
        ];
      }
      return [];
    });

    if (payload.length === 0) {
      toast.error("Selected weekdays don't intersect with the chosen date range.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/roominventory/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventory: payload }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "Failed to save restrictions");
      toast.success("Room blocked for the selected date range");
      onSaved?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const selectedRoom = rooms.find(r => r._id === selectedRoomId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-semibold">Bulk Update — Restrictions</h5>
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
          <Label className="text-xs font-medium uppercase">Select dates to block *</Label>
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
                onClick={() => setSelectedDays(prev => prev.includes(i) ? prev.filter(p => p !== i) : [...prev, i])}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase">Choose room to block *</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
            {loadingRooms ? (
              <div className="text-sm text-muted-foreground">Loading rooms…</div>
            ) : rooms.length === 0 ? (
              <div className="text-sm text-muted-foreground">No rooms found.</div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room._id}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-accent",
                    selectedRoomId === room._id && "bg-accent"
                  )}
                  onClick={() => setSelectedRoomId(room._id)}
                >
                  <Checkbox checked={selectedRoomId === room._id} onCheckedChange={() => setSelectedRoomId(room._id)} />
                  <Label className="text-sm font-medium cursor-pointer">{room.room_name || "Room"}</Label>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <strong>Preview:</strong>{" "}
            {date?.from && date?.to
              ? `Blocking "${selectedRoom?.room_name || "—"}" from ${format(date.from, "PPP")} to ${format(date.to, "PPP")} on ${selectedDaysCount} weekday(s).`
              : "Select date range, weekdays and a room to block."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestrictionUpdate;