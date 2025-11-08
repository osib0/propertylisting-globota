"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const renderSkeletonRow = (count: number = 1) =>
  Array.from({ length: count }).map((_, index) => (
    <TableRow key={index}>
      <TableCell colSpan={4}>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </TableCell>
    </TableRow>
  ));

function NameWithItems({
  name,
  items,
}: {
  name?: string;
  items?: { title?: string }[];
}) {
  const safeName = (name ?? "").trim();
  const titles =
    (items ?? [])
      .map((i) => (i?.title ?? "").trim())
      .filter((t) => t.length > 0) || [];

  if (!safeName && titles.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <>
      {safeName}
      {titles.length > 0 && <> ({titles.join(", ")})</>}
    </>
  );
}

interface RoomTableListProps {
  setEditId: (id: string) => void;
  setEdit: (val: boolean) => void;
  setAddRoom: (val: boolean) => void;
  onAddRateplan: (roomId: string) => void;
  onEditRateplan: (planId: string) => void;
  propertyId: string;
}

const RoomTableList: React.FC<RoomTableListProps> = ({
  setEditId,
  setEdit,
  setAddRoom,
  onAddRateplan,
  onEditRateplan,
  propertyId,
}) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRateplanRoomIds, setActiveRateplanRoomIds] = useState<string[]>(
    []
  );

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/roomlist?propertyId=${propertyId}`);
      const result = await res.json();
      console.log(result,'room list');
      
      if (result.success) {
        setRooms(result.data || []);
      } else {
        console.warn("Failed to fetch rooms:", result);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const mainCheckboxHandler = async (
    id: string,
    events: ChangeEvent<HTMLInputElement>
  ) => {
    const target = events.target;
    try {
      const res = await fetch(`/api/room/updatestatus/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: target.checked ? "active" : "inactive",
        }),
      });
      const data = await res.json();
      if (data.success) toast.success("Room status updated successfully");
      else toast.error("Update failed");
    } catch {
      toast.error("Error updating status");
    }
  };

  const checkboxHandler = async (
    id: string,
    events: ChangeEvent<HTMLInputElement>
  ) => {
    const target = events.target;
    try {
      const res = await fetch(`/api/roomrateplan/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: target.checked ? "active" : "inactive",
        }),
      });
      const data = await res.json();
      if (data.success) toast.success("Rateplan updated successfully");
      else toast.error("Update failed");
    } catch {
      toast.error("Error updating");
    }
  };

  const superCheckboxHandler = async (
    id: string,
    events: ChangeEvent<HTMLInputElement>
  ) => {
    const target = events.target;
    try {
      const res = await fetch(`/api/roomrateplan/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuperPackage: target.checked }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          target.checked ? "Marked as Super Package" : "Super Package removed"
        );
        await fetchRooms();
      } else toast.error(data?.message || "Update failed");
    } catch {
      toast.error("Error updating super flag");
    }
  };

  const deleteHandler = async (id: string) => {
    try {
      const res = await fetch(`/api/room/delete/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        fetchRooms();
        toast.success("Room deleted successfully");
      } else {
        toast.error("Failed to delete room");
      }
    } catch {
      toast.error("Error deleting room");
    }
  };

  const rateplancollapseHandler = (id: string) => {
    setActiveRateplanRoomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <Card className="shadow-none border-0 p-0">
        <div className="overflow-x-auto rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Rateplans</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderSkeletonRow(2)
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground mb-3">No rooms found.</p>
                    <Button
                      onClick={() => setAddRoom(true)}
                      className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
                    >
                      Add Your First Room
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <React.Fragment key={room._id}>
                    <TableRow>
                      <TableCell className="font-medium align-top">
                        {room.room_name}
                      </TableCell>
                      <TableCell className="align-top max-w-[300px] whitespace-normal">
                        {room.description ? (
                          <p>{room.description}</p>
                        ) : (
                          <span className="text-muted-foreground">
                            No description available.
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              defaultChecked={room.status === "active"}
                              onChange={(e) => mainCheckboxHandler(room._id, e)}
                              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            Active
                          </label>

                          <button
                            onClick={() => {
                              setEditId(room._id);
                              setEdit(true);
                            }}
                            className="text-orange-500 hover:underline text-xs flex items-center gap-1"
                          >
                            <Edit2 size={14} /> Edit Room
                          </button>

                          <button
                            onClick={() => deleteHandler(room._id)}
                            className="text-red-500 hover:underline text-xs flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Delete Room
                          </button>

                          <button
                            onClick={() => onAddRateplan(room._id)}
                            className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                          >
                            + Add Rateplan
                          </button>
                        </div>
                      </TableCell>

                      <TableCell className="align-top">
                        <ol className="mb-2 space-y-1">
                          {room?.ratePlans?.map(
                            (el: {
                              _id: string;
                              rateplan_name: string;
                              isSuperPackage?: boolean;
                            }) => (
                              <li key={el._id}>
                                {el.rateplan_name}
                                {el.isSuperPackage && (
                                  <span className="text-xs text-orange-600">
                                    {" "}
                                    (super package)
                                  </span>
                                )}
                              </li>
                            )
                          )}
                        </ol>
                        <button
                          onClick={() => rateplancollapseHandler(room._id)}
                          className="text-orange-600 hover:underline text-xs font-semibold"
                        >
                          Click to View Rateplans
                        </button>
                      </TableCell>
                    </TableRow>

                    {/* COLLAPSED RATEPLAN LIST */}
                    {activeRateplanRoomIds.includes(room._id) && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-muted/30">
                          <div className="border rounded-md p-4">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-200 text-gray-800">
                                  <TableHead>Rateplan Name</TableHead>
                                  <TableHead>Meal Plan</TableHead>
                                  <TableHead>Activity</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {room.ratePlans.length > 0 ? (
                                  room.ratePlans.map((plan: any) => (
                                    <TableRow key={plan._id}>
                                      <TableCell>{plan.rateplan_name}</TableCell>
                                      <TableCell>
                                        <NameWithItems
                                          name={plan?.mealplan_name}
                                          items={plan?.mealplan}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <NameWithItems
                                          name={plan?.activities_name}
                                          items={plan?.activities}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex flex-col gap-1">
                                          <label className="flex items-center gap-2 text-sm">
                                            <input
                                              type="checkbox"
                                              defaultChecked={
                                                plan.status === "active"
                                              }
                                              onChange={(e) =>
                                                checkboxHandler(plan._id, e)
                                              }
                                              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                            />
                                            Active
                                          </label>

                                          <label className="flex items-center gap-2 text-sm">
                                            <input
                                              type="checkbox"
                                              defaultChecked={
                                                !!plan.isSuperPackage
                                              }
                                              onChange={(e) =>
                                                superCheckboxHandler(
                                                  plan._id,
                                                  e
                                                )
                                              }
                                              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                            />
                                            Super Package
                                          </label>

                                          <button
                                            onClick={() =>
                                              onEditRateplan(plan._id)
                                            }
                                            className="text-orange-500 hover:underline text-xs flex items-center gap-1"
                                          >
                                            <Edit2 size={14} /> Edit Rateplan
                                          </button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={4}
                                      className="text-center text-muted-foreground"
                                    >
                                      No rateplans available for this room.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default RoomTableList;
