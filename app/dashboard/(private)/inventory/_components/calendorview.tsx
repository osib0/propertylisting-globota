"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-hot-toast";

type Props = {
    show: boolean;
    onHide: () => void;
    propertyId: string;
    type: "b2c" | "b2b";
};

type Room = { _id: string; room_name: string; ratePlans?: any[] };

type InventoryItem = {
    _id: string;
    room_id: string;
    property_id: string;
    date: string; // ISO
    available_rooms: number;
    status: "block" | "unblock";
    type: "b2c" | "b2b";
};

type RateItem = {
    room_id: string;
    rateplan_id: string;
    property_id: string;
    date: string; // ISO
    base_rate: number;
    extra_rate: number;
    type: "b2c" | "b2b";
};

type FcEvent = {
    id?: string;
    title: string;
    start: string;
    end?: string;
    allDay?: boolean;
    display?: "auto" | "background" | "inverse-background" | "block" | "list-item";
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    extendedProps?: any;
};

const yyyyMmDd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;

const addOneDayISO = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + 1);
    return yyyyMmDd(d);
};

const CalendarViewModal: React.FC<Props> = ({ show, onHide, propertyId, type }) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");
    const [loadingRooms, setLoadingRooms] = useState(true);

    const [range, setRange] = useState<{ start: string; end: string } | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [rates, setRates] = useState<RateItem[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (!show) return;
        let abort = new AbortController();
        (async () => {
            try {
                setLoadingRooms(true);
                const r = await fetch(`/api/room/roomlist/${propertyId}`, { signal: abort.signal });
                const j = await r.json();
                if (!j?.success) throw new Error(j?.error || "Failed to load rooms");
                const list: Room[] = (j.data || []).map((x: any) => ({
                    _id: x._id,
                    room_name: x.room_name,
                    ratePlans: x.ratePlans || [],
                }));
                setRooms(list);

                if (list.length && !selectedRoomId) {
                    setSelectedRoomId(list[0]._id);
                } else if (list.length && selectedRoomId && !list.some(rm => rm._id === selectedRoomId)) {
                    setSelectedRoomId(list[0]._id);
                }
            } catch {
                /* ignore abort */
            } finally {
                setLoadingRooms(false);
            }
        })();
        return () => abort.abort();
    }, [show, propertyId, selectedRoomId]);

    useEffect(() => {
        if (rooms.length && !selectedRoomId) {
            setSelectedRoomId(rooms[0]._id);
        }
    }, [rooms, selectedRoomId]);

    useEffect(() => {
        if (!show || !range || !selectedRoomId) return;
        let abort = new AbortController();
        (async () => {
            try {
                setLoadingData(true);

                const roomParam = `&roomId=${selectedRoomId}`;
                const invUrl = `/api/roominventory/get?startDate=${range.start}&endDate=${range.end}&propertyId=${propertyId}&type=${type}${roomParam}`;
                const rateUrl = `/api/roomrates/get?startDate=${range.start}&endDate=${range.end}&propertyId=${propertyId}&type=${type}${roomParam}`;

                const [invRes, rateRes] = await Promise.all([
                    fetch(invUrl, { signal: abort.signal }),
                    fetch(rateUrl, { signal: abort.signal }),
                ]);
                const [invJson, rateJson] = await Promise.all([invRes.json(), rateRes.json()]);
                if (!invJson?.success) throw new Error(invJson?.error || "Inventory fetch failed");
                if (!rateJson?.success) throw new Error(rateJson?.error || "Rates fetch failed");

                setInventory(invJson.data || []);
                setRates(rateJson.data || []);
            } catch {
                /* ignore abort */
            } finally {
                setLoadingData(false);
            }
        })();
        return () => abort.abort();
    }, [show, range, propertyId, type, selectedRoomId]);

    const events: FcEvent[] = useMemo(() => {
        if (!selectedRoomId) return [];

        const minBaseByDate = new Map<string, number>();
        rates.forEach((rt) => {
            if (rt.type !== type) return;
            if (rt.room_id !== selectedRoomId) return;
            const d = (rt.date || "").slice(0, 10);
            const prev = minBaseByDate.get(d);
            const val = rt.base_rate ?? 0;
            if (prev == null || val < prev) minBaseByDate.set(d, val);
        });

        const out: FcEvent[] = [];

        inventory.forEach((inv) => {
            if (inv.type !== type) return;
            if (inv.room_id !== selectedRoomId) return;

            const start = (inv.date || "").slice(0, 10);
            if (!start) return;

            if ((inv.status || "").toLowerCase() === "block") {
                out.push({
                    id: `block-${inv.room_id}-${start}`,
                    title: `BLOCKED`,
                    start,
                    end: addOneDayISO(start),
                    allDay: true,
                    display: "background",
                    color: "#ff4d4f",
                    backgroundColor: "#ff4d4f",
                    borderColor: "#ff4d4f",
                });
            }

            const chips: string[] = [];
            chips.push(`Avl: ${inv.available_rooms ?? 0}`);
            const base = minBaseByDate.get(start);
            if (base != null) chips.push(`₹${base}`);

            out.push({
                id: `info-${inv.room_id}-${start}`,
                title: chips.join(" • "),
                start,
                allDay: true,
                extendedProps: { inv, baseRate: base },
            });
        });

        return out;
    }, [inventory, rates, type, selectedRoomId]);

    const handleDatesSet = (arg: { start: Date; end: Date }) => {
        setRange({ start: yyyyMmDd(arg.start), end: yyyyMmDd(arg.end) });
    };

    const renderEventContent = (info: any) => {
        if (info.event.display === "background") return null;
        return <div className="text-xs">{info.event.title}</div>;
    };

    return (
        <Dialog open={show} onOpenChange={onHide}>
            <DialogContent className="max-w-7xl w-full p-0 max-h-[90vh]">
                <DialogHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            Calendar — <Badge variant="secondary">{type.toUpperCase()}</Badge>
                        </DialogTitle>
                        <div className="flex items-center gap-10">
                            <Label className="text-sm text-muted-foreground">Room</Label>
                            <Select value={selectedRoomId} onValueChange={setSelectedRoomId} disabled={loadingRooms || rooms.length === 0}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.map((r) => (
                                        <SelectItem key={r._id} value={r._id}>
                                            {r.room_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </DialogHeader>
                <div className="p-4">
                    {(loadingRooms || loadingData || !selectedRoomId) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading…
                        </div>
                    )}
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth",
                        }}
                        height="auto"
                        timeZone="local"
                        editable={false}
                        selectable={false}
                        selectMirror={false}
                        eventStartEditable={false}
                        eventDurationEditable={false}
                        droppable={false}
                        dayMaxEvents={4}
                        events={events}
                        datesSet={handleDatesSet}
                        eventContent={renderEventContent}
                    />
                </div>
                <div className="p-4 border-t bg-muted/50 flex">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-destructive rounded" />
                            Blocked (red background)
                        </span>
                        <span>
                            Title: <code className="bg-background px-1 rounded">Avl: N • ₹Base</code>
                        </span>
                    </div>
                    <Button variant="outline" onClick={onHide} className="ml-auto">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CalendarViewModal;