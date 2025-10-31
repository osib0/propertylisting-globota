"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Info, CheckCircle2 } from "lucide-react";
import { useAppContext } from "../../contextapi";
import Header from "./header";

interface AmenityType {
  _id: string;
  title: string;
  photo: string;
}

interface RoomAmenitiesProps {
  setShareData: (data: any) => void;
  shareData: any;
  defaultData: any;
}

export default function RoomAmenities({
  setShareData,
  shareData,
  defaultData,
}: RoomAmenitiesProps) {
  const [dbAmenities, setDbAmenities] = useState<AmenityType[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<
    Record<string, Record<string, "yes" | "no" | null>>
  >({});
  const [loading, setLoading] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const { setTab } = useAppContext();

  const roomRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch amenities once
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/roomamenities/get");
      const data = await res.json();
      setDbAmenities(data?.data || []);
    })();
  }, []);

useEffect(() => {
  if (!shareData?.room_detail?.length || !dbAmenities.length) return;

  // agar selectedAmenities already filled hain, dobara reset mat karo
  if (Object.keys(selectedAmenities).length > 0) return;

  const initial: Record<string, Record<string, "yes" | "no" | null>> = {};
  shareData.room_detail.forEach((room: any, idx: number) => {
    const roomName = room.roomName || `Room ${idx + 1}`;
    const prevRoomData =
      defaultData?.room_amenities?.[roomName] ||
      shareData?.room_amenities?.[roomName] ||
      {};

    const roomAmenities: Record<string, "yes" | "no" | null> = {};
    dbAmenities.forEach((a) => {
      roomAmenities[a.title] = prevRoomData[a.title] ?? null;
    });

    initial[roomName] = roomAmenities;
  });

  setSelectedAmenities(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [shareData?.room_detail, dbAmenities]);

// Debounced sync with parent data (like Location component)
useEffect(() => {
  const timer = setTimeout(() => {
    setShareData((prev: any) => ({
      ...prev,
      room_amenities: selectedAmenities,
    }));
  }, 300);

  return () => clearTimeout(timer);
}, [selectedAmenities, setShareData]);

  // Handle yes/no selection
  const handleAmenityChoice = (
    roomName: string,
    title: string,
    choice: "yes" | "no"
  ) => {
    setSelectedAmenities((prev) => ({
      ...prev,
      [roomName]: {
        ...prev[roomName],
        [title]: prev[roomName]?.[title] === choice ? null : choice,
      },
    }));
  };

const handleNext = async () => {
  setLoading(true);
  if (Object.keys(selectedAmenities).length === 0) {
    alert("Please select at least one amenity.");
    setLoading(false);
    return;
  }
  setTab("Room Photos");
  setLoading(false);
};


  // Summary Info
  const summary = useMemo(() => {
    const totalRooms = shareData?.room_detail?.length || 0;
    const totalAmenities = dbAmenities.length;
    let selectedCount = 0;

    Object.values(selectedAmenities).forEach((room) => {
      Object.values(room).forEach((val) => {
        if (val === "yes") selectedCount++;
      });
    });

    return { totalRooms, totalAmenities, selectedCount };
  }, [selectedAmenities, dbAmenities, shareData?.room_detail]);

  // Scroll Tracking
  useEffect(() => {
    const handleScroll = () => {
      let current = null;
      for (const [roomName, el] of Object.entries(roomRefs.current)) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            current = roomName;
            break;
          }
        }
      }
      setActiveRoom(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToRoom = (roomName: string) => {
    const el = roomRefs.current[roomName];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!shareData?.room_detail?.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        Please create at least one room first.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full relative">
      <Header
        title="Room Amenities"
        description="Select which amenities are available for each room."
      />

      {/* Summary Bar */}
      <div className="px-6 py-3 mt-3 mb-4 flex flex-wrap justify-between items-center max-w-6xl mx-auto w-full text-sm text-gray-700 rounded-xl bg-white">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="font-medium">
            Total Rooms: {summary.totalRooms}
          </span>
        </div>
        <span>Total Amenities: {summary.totalAmenities}</span>
        <span>Selected: {summary.selectedCount}</span>
      </div>

      {/* Layout with Sidebar */}
      <div className="flex max-w-6xl mx-auto w-full gap-6 relative">
        {/* Side Wizard */}
        <div className="hidden md:flex flex-col sticky top-24 h-[calc(100vh-6rem)] w-48 border-r border-gray-200 pr-3 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            Room Navigator
          </h3>
          <div className="flex flex-col gap-2">
            {shareData.room_detail.map((room: any, idx: number) => {
              const roomName = room.roomName || `Room ${idx + 1}`;
              const selectedCount = Object.values(
                selectedAmenities[roomName] || {}
              ).filter((v) => v === "yes").length;
              const total = dbAmenities.length;

              return (
                <button
                  key={idx}
                  onClick={() => scrollToRoom(roomName)}
                  className={`flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    activeRoom === roomName
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <span>{roomName}</span>
                  {selectedCount === total && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto space-y-10 max-w-4xl">
          {shareData.room_detail.map((room: any, roomIdx: number) => {
            const roomName = room.roomName || `Room ${roomIdx + 1}`;
            const roomAmenities = selectedAmenities[roomName] || {};

            return (
              <div
                key={roomIdx}
                ref={(el) => {
                  if (el) {
                    roomRefs.current[roomName] = el
                  }
                }}
              >
                <Card className="p-6 rounded-2xl shadow-none border border-gray-100 bg-white">
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {roomName}
                    </h2>
                    <span className="text-sm text-gray-500">
                      Selected:{" "}
                      {
                        Object.values(roomAmenities).filter((v) => v === "yes")
                          .length
                      }{" "}
                      / {dbAmenities.length}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {dbAmenities.map((data) => (
                      <Card
                        key={data._id}
                        className={`p-4 rounded-2xl border hover:shadow-md transition-all duration-200 ${
                          roomAmenities[data.title] === "yes"
                            ? "border-green-500 shadow-md"
                            : roomAmenities[data.title] === "no"
                            ? "border-red-400"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-base truncate">
                            {data.title}
                          </span>
                          {data.photo && (
                            <Image
                              src={data.photo}
                              alt={data.title}
                              width={22}
                              height={22}
                              className="object-contain"
                            />
                          )}
                        </div>

                        <RadioGroup
                          className="flex gap-4"
                          value={roomAmenities[data.title] || ""}
                          onValueChange={(val: "yes" | "no") =>
                            handleAmenityChoice(roomName, data.title, val)
                          }
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem
                              value="yes"
                              id={`${roomIdx}-${data._id}-yes`}
                              className="border-green-500 data-[state=checked]:bg-green-500"
                            />
                            <Label
                              htmlFor={`${roomIdx}-${data._id}-yes`}
                              className="text-sm cursor-pointer"
                            >
                              Yes
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem
                              value="no"
                              id={`${roomIdx}-${data._id}-no`}
                              className="border-red-500 data-[state=checked]:bg-red-500"
                            />
                            <Label
                              htmlFor={`${roomIdx}-${data._id}-no`}
                              className="text-sm cursor-pointer"
                            >
                              No
                            </Label>
                          </div>
                        </RadioGroup>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center gap-2">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setTab("Sleeping Arrangement")}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" /> Processing...
            </>
          ) : (
            <>
              Next Step <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
