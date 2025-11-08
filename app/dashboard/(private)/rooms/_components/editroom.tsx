"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EditStepOne from "./editroom/stepone";
import EditStepTwo from "./editroom/steptwo";
import EditStepThree from "./editroom/stepthree";
import EditStepFour from "./editroom/stepfoure";
import ShowGallery from "./editroom/showgallery";
import PhotoSelectorModal from "./editroom/photoselect";

interface RoomCategoryEditProps {
  setEdit: (v: boolean) => void;
  id: string;
}

export default function RoomCategoryEdit({ setEdit, id }: RoomCategoryEditProps) {
  const [roomProperty, setRoomProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [gallerySelector, setGallerySelector] = useState(false);
  const [sharedFormData, setSharedFormData] = useState<any>({});

  useEffect(() => {
    (async () => {
      try {
        if (!id) return setEdit(false);
        const res = await fetch(`/api/rooms/get/${id}`);
        const json = await res.json();
        console.log(json,'json room');
        
        if (json?.success) setRoomProperty(json.data);
        else toast.error("Room not found");
      } catch (e) {
        toast.error("Error loading room data");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, setEdit]);

  async function roomUpdateHandler(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch(`/api/rooms/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(sharedFormData),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Room update successfully!");
        setTimeout(() => setEdit(false), 800);
      } else {
        toast.error(result.message || "Failed to update room.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  }

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h6 className="m-0 flex items-center gap-1 text-base font-semibold">
          <button
            className="font-semibold cursor-pointer hover:underline"
            onClick={() => setEdit(false)}
            aria-label="Back to Room"
          >
            Room
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold truncate max-w-[200px]">
            {roomProperty?.room_name || "Room"}
          </span>
          <ChevronRight className="h-4 w-4" />
          Edit
        </h6>
        <Button variant="ghost" size="sm" onClick={() => setEdit(false)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>

      {!showGallery ? (
        <div className="space-y-4">
          <Card className="p-4">
            <EditStepOne id={id} setSharedFormData={setSharedFormData} />
          </Card>
          <Card className="p-4">
            <EditStepTwo id={id} setSharedFormData={setSharedFormData} />
          </Card>
          <Card className="p-4">
            <EditStepThree id={id} setSharedFormData={setSharedFormData} />
          </Card>
          <Card className="p-4">
            <EditStepFour id={id} setSharedFormData={setSharedFormData} />
          </Card>
        </div>
      ) : (
        <ShowGallery setGallerySelector={setGallerySelector} />
      )}

      <PhotoSelectorModal open={gallerySelector} onOpenChange={setGallerySelector} />

      <div className="w-full flex justify-end mt-4">
        <Button onClick={roomUpdateHandler} className="font-semibold">Update</Button>
      </div>
    </div>
  );
}
