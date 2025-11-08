"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/app/contextapi";
import RoomTableList from "./_components/roomlist";
import AddRateplanForm from "./_components/addrateplan";
import EditRateplans from "./_components/editrateplan";
import RoomAdd from "./_components/addroom";
import RoomCategoryEdit from "./_components/editroom";



const Page = () => {
    const [editId, setEditId] = useState<string>("");
    const [rateplanRoomId, setRateplanRoomId] = useState<string>("");
    const [editRateplanRoomId, setEditRateplanRoomId] = useState<string>("");

    const {
        isAddRateplan,
        isAddRoom,
        isEdit,
        isEditRateplan,
        setAddRateplan,
        setAddRoom,
        setEdit,
        setEditRateplan,
        propertyId,
        userId
    } = useAppContext();

    const handleAddRateplan = (roomId: string) => {
        setRateplanRoomId(roomId);
        setAddRateplan(true);
    };

    const handleEditRateplan = (roomId: string) => {
        setEditRateplanRoomId(roomId);
        setEditRateplan(true);
    };

    return (
        <div className="max-w-7xl mx-auto  bg-white p-5">
            {!isAddRoom && !isEdit && !isAddRateplan && !isEditRateplan && (
                <Card className="border-0 shadow-none p-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-semibold text-gray-800">
                            Room
                        </CardTitle>
                        <Button
                            variant={'secondary'}
                            className="font-medium cursor-pointer rounded-xl"
                            onClick={() => setAddRoom(true)}
                        >
                            + Add Room
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RoomTableList
                            setAddRoom={setAddRoom}
                            setEditId={setEditId}
                            setEdit={setEdit}
                            propertyId={propertyId ?? ''}
                            onAddRateplan={handleAddRateplan}
                            onEditRateplan={handleEditRateplan}
                        />
                    </CardContent>
                </Card>
            )}

            {/* ---------- ADD RATEPLAN ---------- */}
            {isAddRateplan && (
                <AddRateplanForm
                    roomId={rateplanRoomId}
                    onBack={() => setAddRateplan(false)}
                />
            )}

            {/* ---------- EDIT RATEPLAN ---------- */}
            {isEditRateplan && (
                <EditRateplans
                    roomId={editRateplanRoomId}
                    onBack={() => setEditRateplan(false)}
                />
            )}

            {/* ---------- ADD ROOM ---------- */}
            {isAddRoom && (
                <RoomAdd
                    setAddRoom={setAddRoom}
                    propertyId={propertyId}
                    userId={userId}
                />
            )}

            {/* ---------- EDIT ROOM ---------- */}
            {isEdit && (
        <RoomCategoryEdit
          setEdit={setEdit}
          id={editId}
        />
      )}
        </div>
    );
};

export default Page;
