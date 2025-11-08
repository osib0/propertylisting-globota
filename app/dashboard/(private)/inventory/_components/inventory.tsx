"use client";
import {
    useEffect,
    useState,
    useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarDays, ChevronRight as ChevronRightIcon, Minus, Lock, Plus, User, PlusSquare, MinusSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import CalendarViewModal from "./calendorview";
import RestrictionUpdate from "./restrictionupdate";
import BulkUpdate from "./bulkupdate";
import InventorySkeleton from "./skeliton";
import RateModel from "./ratemodel";
import { useAppContext } from "@/app/contextapi";

type Tab = "B2C" | "B2B";
type BulkPanel = false | "inventory" | "rates" | "restriction";

interface Room {
    _id: string;
    room_name: string;
    ratePlans?: RatePlan[];
}

interface RatePlan {
    _id: string;
    rateplan_name: string;
}

interface DateItem {
    day: string;
    date: number;
    month: string;
    fullDate: string;
}

interface InventoryItem {
    _id: string;
    room_id: string;
    date: string;
    available_rooms: number;
    status: "block" | "unblock";
    property_id: string;
}

interface RateItem {
    _id: string;
    room_id: string;
    rateplan_id: string;
    date: string; // ISO date
    base_rate: number;
    base_rate_boost?: number;
    extra_rate: number;
    extra_rate_boost?: number;
    extra_adult_charge?: number;
    extra_adult_charge_boost?: number;
    paid_child_rate?: number;
    paid_child_rate_boost?: number;
    type: string; // "b2b" | "b2c"
}

const tabs: Tab[] = ["B2C", "B2B"];

const ManageInventory = () => {
    const [activeTab, setActiveTab] = useState<Tab>("B2C");
    const [dates, setDates] = useState<DateItem[]>([]);
    const [roomState, setRoomState] = useState<Room[]>([]);
    const [ratePlan, setRatePlan] = useState<RatePlan[]>([]);
    const [boostprice, setBoostprice] = useState<boolean>(false);
    const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [roomInventory, setRoomInventory] = useState<Record<string, number>>({});
    const [unblocked, setUnblocked] = useState<Record<number, Record<number, boolean>>>({});
    const [roomRatesData, setRoomRatesData] = useState<
        Record<
            string,
            {
                base_rate: number;
                base_rate_boost?: number;
                extra_rate: number;
                extra_rate_boost?: number;
                extra_adult_charge?: number;
                extra_adult_charge_boost?: number;
                paid_child_rate?: number;
                paid_child_rate_boost?: number;
            }
        >
    >({});
    const [showRateModal, setShowRateModal] = useState(false);
    const [bulkUpdate, setBulkUpdate] = useState<BulkPanel>(false);
    const [expandedRooms, setExpandedRooms] = useState<number[]>([]);
    const [allExpanded, setAllExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveLoader, setSaveLoader] = useState(false);
    const [bootLoading, setBootLoading] = useState(true);
    const [showCalendar, setShowCalendar] = useState(false);

    const { propertyId } = useAppContext()
    const currentType: "b2c" | "b2b" = activeTab === "B2C" ? "b2c" : "b2b";

    const generateDates = useCallback((baseDate: Date): DateItem[] => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return {
                day: d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase(),
                date: d.getDate(),
                month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
                fullDate: `${year}-${month}-${day}`,
            };
        });
    }, []);

    useEffect(() => {
        setDates(generateDates(startDate));
    }, [startDate, generateDates]);

    useEffect(() => {
        let abort = new AbortController();
        (async () => {
            if (!propertyId) return;

            try {
                setBootLoading(true);
                setError(null);

                const r = await fetch(`/api/rooms/roomlist?propertyId=${propertyId}`, {
                    signal: abort.signal,
                    cache: "no-store",
                });
                const j = await r.json();
                if (!j?.success) throw new Error(j?.error || "Failed to load rooms");

                const rooms: Room[] = (j.data || []).map((x: any) => ({
                    _id: x._id,
                    room_name: x.room_name,
                    ratePlans: x.ratePlans || [],
                }));



                setRoomState(rooms);

                const planMap = new Map<string, RatePlan>();
                rooms.forEach((rm) => {
                    (rm.ratePlans || []).forEach((p) => {
                        if (!planMap.has(p._id)) planMap.set(p._id, p);
                    });
                });
                setRatePlan(Array.from(planMap.values()));
            } catch (e: any) {
                if (e?.name !== "AbortError")
                    setError(e?.message || "Failed to load rooms");
            } finally {
                setBootLoading(false);
            }
        })();

        return () => abort.abort();
    }, [propertyId]);

    useEffect(() => {
        let abort = new AbortController();

        (async () => {
            if (!propertyId) return;

            try {
                setBootLoading(true);
                setError(null);

                const r = await fetch(`/api/listproperty/get/?ownerId=${propertyId}`, {
                    signal: abort.signal,
                    cache: "no-store",
                });

                const j = await r.json();
                console.log(j, "rooms list data");

                if (!j?.success) throw new Error(j?.error || "Failed to load rooms");

                const properties = Array.isArray(j.data) ? j.data : [j.data];

                const rooms = properties.flatMap((property: any) =>
                    (property.room_detail || []).map((room: any) => {
                        const roomQty = Number(room.numRooms);
                        return {
                            _id: property._id,
                            room_name: room.roomName || "Unnamed Room",
                            room_type: room.roomType || "",
                            room_quantity: !isNaN(roomQty) && roomQty > 0 ? roomQty : 1,
                            room_view: room.roomView || "",
                            description: room.description || "",
                            ratePlans: room.ratePlans || [],
                            propertyId: property.ownerId,
                        };
                    })
                );

                console.log(rooms, "formatted rooms");
                setRoomState(rooms);
                const planMap = new Map<string, RatePlan>();
                rooms.forEach((rm: { ratePlans: any; }) => {
                    (rm.ratePlans || []).forEach((p: RatePlan) => {
                        if (!planMap.has(p._id)) planMap.set(p._id, p);
                    });
                });
                setRatePlan(Array.from(planMap.values()));
            } catch (e: any) {
                if (e?.name !== "AbortError") setError(e?.message || "Failed to load rooms");
            } finally {
                setBootLoading(false);
            }
        })();

        return () => abort.abort();
    }, [propertyId]);

    const canQuery = roomState.length > 0 && dates.length > 0 && propertyId;

    const fetchInventory = useCallback(
        async (signal?: AbortSignal) => {
            const start = dates[0]?.fullDate;
            const end = dates[dates.length - 1]?.fullDate;
            if (!start || !end || !canQuery) return;

            const url = `/api/roominventory/get?startDate=${start}&endDate=${end}&propertyId=${propertyId}&type=${currentType}`;
            const res = await fetch(url, { signal });
            const json = await res.json();
            console.log(json, 'inventory data');

            if (!json?.success)
                throw new Error(json?.error || "Failed to load inventory");

            const inventory: Record<string, number> = {};
            const blockMap: Record<number, Record<number, boolean>> = {};

            roomState.forEach((room, roomIndex) => {
                dates.forEach((date, dateIndex) => {
                    const inv: InventoryItem | undefined = json.data.find(
                        (it: InventoryItem) =>
                            it.room_id === room._id &&
                            it.date.startsWith(date.fullDate) &&
                            it.property_id === propertyId
                    );
                    inventory[`${roomIndex}-${dateIndex}`] = inv?.available_rooms ?? 0;
                    blockMap[roomIndex] = blockMap[roomIndex] || {};
                    blockMap[roomIndex][dateIndex] = inv?.status === "block";
                });
            });

            setRoomInventory(inventory);
            setUnblocked(blockMap);
        },
        [roomState, dates, propertyId, currentType, canQuery]
    );

    const rateKey = (roomIndex: number, planIndex: number, dateIndex: number) => {
        const room = roomState[roomIndex];
        const plans = room.ratePlans?.length ? room.ratePlans : ratePlan;
        const plan = plans[planIndex];
        const dateStr = dates[dateIndex].fullDate;
        return `${room._id}|${plan._id}|${dateStr}`;
    };

    const fetchRates = useCallback(
        async (signal?: AbortSignal) => {
            const start = dates[0]?.fullDate;
            const end = dates[dates.length - 1]?.fullDate;
            if (!start || !end || !canQuery) return;

            const url = `/api/roomrates/get?startDate=${start}&endDate=${end}&propertyId=${propertyId}&type=${currentType}`;
            const res = await fetch(url, { signal });
            const json = await res.json();
            if (!json?.success)
                throw new Error(json?.error || "Failed to load rates");

            const apiLookup = new Map<
                string,
                {
                    base_rate: number;
                    base_rate_boost: number;
                    extra_rate: number;
                    extra_rate_boost: number;
                    extra_adult_charge: number;
                    extra_adult_charge_boost: number;
                    paid_child_rate: number;
                    paid_child_rate_boost: number;
                }
            >();

            (json.data as RateItem[]).forEach((rt) => {
                const d = (rt.date || "").slice(0, 10);
                apiLookup.set(`${rt.room_id}|${rt.rateplan_id}|${d}`, {
                    base_rate: rt?.base_rate ?? 0,
                    base_rate_boost: rt?.base_rate_boost ?? 0,
                    extra_rate: rt?.extra_rate ?? 0,
                    extra_rate_boost: rt?.extra_rate_boost ?? 0,
                    extra_adult_charge: rt?.extra_adult_charge ?? 0,
                    extra_adult_charge_boost: rt?.extra_adult_charge_boost ?? 0,
                    paid_child_rate: rt?.paid_child_rate ?? 0,
                    paid_child_rate_boost: rt?.paid_child_rate_boost ?? 0,
                });
            });

            const map: Record<string, any> = {};
            roomState.forEach((room) => {
                const plans = room.ratePlans?.length ? room.ratePlans : ratePlan;
                plans.forEach((plan) => {
                    dates.forEach((date) => {
                        const k = `${room._id}|${plan._id}|${date.fullDate}`;
                        map[k] = apiLookup.get(k) ?? {
                            base_rate: 0,
                            base_rate_boost: 0,
                            extra_rate: 0,
                            extra_rate_boost: 0,
                            extra_adult_charge: 0,
                            extra_adult_charge_boost: 0,
                            paid_child_rate: 0,
                            paid_child_rate_boost: 0,
                        };
                    });
                });
            });

            setRoomRatesData(map);
        },
        [roomState, ratePlan, dates, propertyId, currentType, canQuery]
    );

    useEffect(() => {
        if (!canQuery) return;
        let abort = new AbortController();
        (async () => {
            try {
                setError(null);
                await Promise.all([
                    fetchInventory(abort.signal),
                    fetchRates(abort.signal),
                ]);
            } catch (e: any) {
                if (e?.name !== "AbortError")
                    setError(e?.message || "Failed to load data");
            }
        })();
        return () => abort.abort();
    }, [canQuery, activeTab, dates, fetchInventory, fetchRates]);

    const handlePrev = () =>
        setStartDate(
            (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7)
        );
    const handleNext = () =>
        setStartDate(
            (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)
        );

    const toggleAllRooms = () => {
        if (allExpanded) setExpandedRooms([]);
        else setExpandedRooms(roomState.map((_, i) => i));
        setAllExpanded((v) => !v);
    };

    const showExtraprice = (planId: any) => {
        setExpandedPlans((prev) => ({
            ...prev,
            [planId]: !prev[planId],
        }));
    };

    const handleUnblock = (roomIndex: number, slotIndex: number) => {
        setUnblocked((prev) => ({
            ...prev,
            [roomIndex]: { ...(prev[roomIndex] || {}), [slotIndex]: false },
        }));
    };

    const handleInventoryChange = (
        roomIndex: number,
        dateIndex: number,
        value: string
    ) => {
        const key = `${roomIndex}-${dateIndex}`;
        const num = Math.max(0, parseInt(value || "0", 10) || 0);
        setRoomInventory((prev) =>
            prev[key] === num ? prev : { ...prev, [key]: num }
        );
    };

    const handleRateChange = (
        roomIndex: number,
        planIndex: number,
        dateIndex: number,
        field:
            | "base_rate"
            | "extra_rate"
            | "extra_adult_charge"
            | "paid_child_rate",
        value: string
    ) => {
        const key = rateKey(roomIndex, planIndex, dateIndex);
        const num = Math.max(0, parseInt(value || "0", 10) || 0);
        setRoomRatesData((prev) => {
            const curr = prev[key] || { base_rate: 0, extra_rate: 0 };
            if (curr[field] === num) return prev;
            return { ...prev, [key]: { ...curr, [field]: num } };
        });
    };

    const handleSaveAndContinue = async () => {
        const invPayload = roomState.flatMap((room, roomIndex) =>
            dates.map((date, dateIndex) => {
                const formatted = date.fullDate;
                return {
                    type: currentType,
                    room_id: room._id,
                    property_id: propertyId,
                    date: formatted,
                    available_rooms: roomInventory[`${roomIndex}-${dateIndex}`] ?? 0,
                    status: unblocked[roomIndex]?.[dateIndex] ? "block" : "unblock",
                };
            })
        );

        const ratesPayload = roomState.flatMap((room, roomIndex) => {
            const plans = room.ratePlans?.length ? room.ratePlans : ratePlan;
            return plans.flatMap((plan, planIndex) =>
                dates.map((date, dateIndex) => {
                    const formatted = date.fullDate;
                    const val = roomRatesData[
                        rateKey(roomIndex, planIndex, dateIndex)
                    ] || {
                        base_rate: 0,
                        extra_rate: 0,
                        extra_adult_charge: 0,
                        paid_child_rate: 0,
                    };
                    return {
                        type: currentType,
                        room_id: room._id,
                        property_id: propertyId,
                        rateplan_id: plan._id,
                        date: formatted,
                        base_rate: val.base_rate,
                        extra_rate: val.extra_rate,
                        extra_adult_charge: val.extra_adult_charge ?? 0,
                        paid_child_rate: val.paid_child_rate ?? 0,
                    };
                })
            );
        });

        try {
            setSaveLoader(true);
            setError(null);

            const [invRes, rateRes] = await Promise.all([
                fetch("/api/roominventory/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ inventory: invPayload }),
                }),
                fetch("/api/roomrates/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rates: ratesPayload }),
                }),
            ]);

            const [invJson, rateJson] = await Promise.all([
                invRes.json(),
                rateRes.json(),
            ]);
            if (!invJson?.success)
                throw new Error(invJson?.error || "Failed to save inventory");
            if (!rateJson?.success)
                throw new Error(rateJson?.error || "Failed to save rates");

            toast.success("Saved successfully");
            let abort = new AbortController();
            await Promise.all([
                fetchInventory(abort.signal),
                fetchRates(abort.signal),
            ]);
        } catch (e: any) {
            setError(e?.message || "Save failed");
            toast.error(e?.message || "Save failed");
        } finally {
            setSaveLoader(false);
        }
    };

    if (bootLoading) return <InventorySkeleton />;

    const todayStr = (() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    })();

    return (
        <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 min-h-screen bg-background">
            {!bulkUpdate ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">
                                Manage Inventory, Rates & Restrictions
                            </h3>
                            <p className="text-sm text-muted-foreground">Rates in: INR</p>
                        </div>
                        {error && <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">{error}</div>}
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-between items-center">
                        <div className="flex rounded-md border overflow-hidden">
                            {tabs.map((tab) => (
                                <Button
                                    key={tab}
                                    variant={activeTab === tab ? "default" : "ghost"}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium",
                                        activeTab === tab && "bg-primary text-primary-foreground"
                                    )}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Show Boost Price</span>
                                <Switch checked={boostprice} onCheckedChange={setBoostprice} />
                            </div>
                            <Button variant="outline" onClick={() => setShowCalendar(true)}>
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Calendar
                            </Button>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1" />
                        <Select onValueChange={(value) => setBulkUpdate(value as BulkPanel)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="BULK UPDATE" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inventory">Inventory</SelectItem>
                                <SelectItem value="rates">Rates</SelectItem>
                                <SelectItem value="restriction">Restrictions</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex border rounded-md overflow-hidden">
                            <Button variant="ghost" size="sm" onClick={handlePrev}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        {format(startDate, "PPP")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        className="rounded-md border shadow-sm"
                                        captionLayout="dropdown"
                                        required
                                    />
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="sm" onClick={handleNext}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Calendar Header */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <div className="w-1/4">
                                    <h4 className="text-sm font-medium">Rooms & Rates</h4>
                                </div>
                                <div className="flex-1 flex justify-between">
                                    {dates.map((item, index) => {
                                        const isToday = todayStr === item.fullDate;
                                        return (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "flex flex-col items-center py-2 border-l flex-1",
                                                    isToday && "bg-primary text-primary-foreground"
                                                )}
                                            >
                                                <span className="text-xs font-bold uppercase text-primary/80">
                                                    {item.day}
                                                </span>
                                                <span className="text-2xl font-normal">{item.date}</span>
                                                <span className="text-xs font-medium text-zinc-400">{item.month}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rooms grid */}
                    <div>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 mb-3 text-xs uppercase font-semibold"
                            onClick={toggleAllRooms}
                        >
                            {allExpanded ? <MinusSquare className="h-4 w-4" /> : <PlusSquare className="h-4 w-4" />}
                            {allExpanded ? "Hide Rate" : "Expand all Rooms & Rateplans"}
                        </Button>

                        <div className="space-y-2">
                            {roomState.map((room, roomIndex) => (
                                <div key={room._id}>
                                    <div className="flex border rounded-md mb-2 overflow-hidden">
                                        <div className="w-1/4 bg-background border-r p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 rounded-full"
                                                    onClick={() =>
                                                        setExpandedRooms((prev) =>
                                                            prev.includes(roomIndex)
                                                                ? prev.filter((i) => i !== roomIndex)
                                                                : [...prev, roomIndex]
                                                        )
                                                    }
                                                >
                                                    {expandedRooms.includes(roomIndex) ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                                </Button>
                                                <span className="font-medium text-sm capitalize">{room.room_name}</span>
                                            </div>
                                            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                                        </div>

                                        {dates.map((item, idx) => (
                                            <div key={idx} className="flex-1 p-2">
                                                <Card className={cn("border-2 py-0 border-dashed", unblocked[roomIndex]?.[idx] && "border-destructive bg-destructive/5")}>
                                                    <CardContent className="p-3 text-center">
                                                        {unblocked[roomIndex]?.[idx] ? (
                                                            <>
                                                                <div className="flex justify-center items-center gap-1 text-destructive mb-2 text-sm">
                                                                    <Lock className="h-4 w-4" />
                                                                    <span className="font-bold">{item.date}</span>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="px-3 py-1 mb-2 text-xs bg-primary"
                                                                    onClick={() => handleUnblock(roomIndex, idx)}
                                                                >
                                                                    Unblock
                                                                </Button>
                                                                <div className="text-xs text-muted-foreground">0 sold</div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Input
                                                                    // type="number"
                                                                    value={roomInventory[`${roomIndex}-${idx}`] ?? ""}
                                                                    onChange={(e) => handleInventoryChange(roomIndex, idx, e.target.value)}
                                                                    className="text-center mb-2"
                                                                    min={0}
                                                                />
                                                                <div className="text-xs text-muted-foreground">Open Rooms</div>
                                                            </>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>

                                    {expandedRooms.includes(roomIndex) && (
                                        <div className="space-y-4">
                                            {(room.ratePlans?.length ? room.ratePlans : ratePlan).map((plan, planIndex) => (
                                                <div key={plan._id} className="border rounded-md p-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-1/4">
                                                            <div className="font-bold text-primary uppercase text-sm">{plan.rateplan_name}</div>
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="text-xs text-gray-600 h-auto p-0"
                                                                onClick={() => showExtraprice(plan._id)}
                                                            >
                                                                Extra Rates & Restrictions
                                                            </Button>
                                                        </div>
                                                        <div className="w-3/4 grid grid-cols-7 gap-2">
                                                            {dates.map((_, idx) => {
                                                                const currentRateData = roomRatesData[rateKey(roomIndex, planIndex, idx)];
                                                                const baseRateBoost = currentRateData?.base_rate_boost;
                                                                const extraRateBoost = currentRateData?.extra_rate_boost;
                                                                const extraAdultBoost = currentRateData?.extra_adult_charge_boost;
                                                                const paidChildBoost = currentRateData?.paid_child_rate_boost;

                                                                return (
                                                                    <div key={idx} className="flex flex-col items-center gap-2">
                                                                        <Input
                                                                            type="number"
                                                                            className="w-full text-center h-10"
                                                                            value={currentRateData?.base_rate ?? ""}
                                                                            onChange={(e) => handleRateChange(roomIndex, planIndex, idx, "base_rate", e.target.value)}
                                                                            min={0}
                                                                        />
                                                                        {boostprice && baseRateBoost && baseRateBoost > 0 && (
                                                                            <div className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Boost {Math.round(baseRateBoost)}</div>
                                                                        )}
                                                                        <Input
                                                                            type="number"
                                                                            className="w-full text-center h-10"
                                                                            value={currentRateData?.extra_rate ?? ""}
                                                                            onChange={(e) => handleRateChange(roomIndex, planIndex, idx, "extra_rate", e.target.value)}
                                                                            min={0}
                                                                        />
                                                                        {boostprice && extraRateBoost && extraRateBoost > 0 && (
                                                                            <div className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Boost {Math.round(extraRateBoost)}</div>
                                                                        )}
                                                                        {expandedPlans[plan._id] && (
                                                                            <>
                                                                                <Input
                                                                                    type="number"
                                                                                    className="w-full text-center h-10"
                                                                                    value={currentRateData?.extra_adult_charge ?? ""}
                                                                                    onChange={(e) => handleRateChange(roomIndex, planIndex, idx, "extra_adult_charge", e.target.value)}
                                                                                    placeholder="+1 Adult"
                                                                                    min={0}
                                                                                />
                                                                                {boostprice && extraAdultBoost && extraAdultBoost > 0 && (
                                                                                    <div className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Boost {Math.round(extraAdultBoost)}</div>
                                                                                )}
                                                                                <Input
                                                                                    type="number"
                                                                                    className="w-full text-center h-10"
                                                                                    value={currentRateData?.paid_child_rate ?? ""}
                                                                                    onChange={(e) => handleRateChange(roomIndex, planIndex, idx, "paid_child_rate", e.target.value)}
                                                                                    placeholder="Child Rate"
                                                                                    min={0}
                                                                                />
                                                                                {boostprice && paidChildBoost && paidChildBoost > 0 && (
                                                                                    <div className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Boost {Math.round(paidChildBoost)}</div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={handleSaveAndContinue} disabled={saveLoader} className="bg-primary">
                            {saveLoader ? <span className="flex items-center gap-2">Saving <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span> : "Save"}
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {bulkUpdate === "inventory" && (
                        <BulkUpdate
                            mode="inventory"
                            type={currentType}
                            propertyId={propertyId ?? ''}
                            onClose={() => setBulkUpdate(false)}
                            fetchRates={fetchRates}
                            fetchInventory={fetchInventory}
                        />
                    )}
                    {bulkUpdate === "rates" && (
                        <BulkUpdate
                            mode="rates"
                            type={currentType}
                            propertyId={propertyId ?? ''}
                            onClose={() => setBulkUpdate(false)}
                            fetchRates={fetchRates}
                            fetchInventory={fetchInventory}
                        />
                    )}
                    {bulkUpdate === "restriction" && (
                        <RestrictionUpdate
                            type={currentType}
                            propertyId={propertyId ?? ''}
                            onClose={() => setBulkUpdate(false)}
                            onSaved={async () => {
                                setBulkUpdate(false);
                                try {
                                    let abort = new AbortController();
                                    await fetchInventory(abort.signal);
                                } catch { }
                            }}
                        />
                    )}
                </>
            )}

            <CalendarViewModal
                show={showCalendar}
                onHide={() => setShowCalendar(false)}
                propertyId={propertyId ?? ''}
                type={currentType}
            />
            <RateModel showRateModal={showRateModal} setShowRateModal={setShowRateModal} />
        </div>
    );
};

export default ManageInventory;