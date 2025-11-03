// path: components/propertymanagement/property/room/rateplan/rateplanadd/RatePlans.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import {
  Button,
} from "@/components/ui/button";
import {
  Input,
} from "@/components/ui/input";
import {
  Label,
} from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Checkbox,
} from "@/components/ui/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Loader2 ,ChevronLeft} from "lucide-react";

interface Item {
  itemsId: string;
  title: string;
}

interface Activity {
  _id: string;
  title: string;
  items?: Item[];
}

interface Meal {
  _id: string;
  title: string;
  items: Item[];
}

interface Rateplan {
  title: string;
}

interface Props {
  roomId: string;
  setEditId?: (id: string) => void;
  setEdit?: (flag: boolean) => void;
  setAddRoom?: (flag: boolean) => void;
  onAddRateplan?: () => void;
  onBack?: () => void;
}

export default function AddRateplanForm({
  roomId,
  onAddRateplan,
  onBack,
}: Props) {
  const [rateplan, setRateplan] = useState<Rateplan[]>([]);
  const [mealplan, setMealplan] = useState<Meal[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [rateplanName, setRateplanName] = useState<string>("");
  const [selectedMealId, setSelectedMealId] = useState<string>("");
  const [selectedMeals, setSelectedMeals] = useState<Item[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<Item[]>([]);
  const [cancellationPolicy, setCancellationPolicy] = useState<string>("");
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [isSuperPackage, setIsSuperPackage] = useState<boolean>(false);

  const params = useParams();
  const propertyId = (params as any).id;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const [rateRes, mealRes, activityRes] = await Promise.all([
        fetch("/api/plan/get"),
        fetch("/api/mealsmaster/get"),
        fetch("/api/activitymaster/get"),
      ]);
      const rateData = await rateRes.json();
      const mealData = await mealRes.json();
      const activityData = await activityRes.json();

      setRateplan(rateData.data || []);
      setMealplan(mealData.data || []);
      setActivity(activityData.data || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const selected = mealplan.find((m) => m._id === selectedMealId);
    if (!selected) {
      if (selectedMeals.length) setSelectedMeals([]);
      return;
    }
    setSelectedMeals((prev) =>
      prev.filter((m) => selected.items?.some((it) => it.itemsId === m.itemsId))
    );
  }, [selectedMealId, mealplan]);

  useEffect(() => {
    const selected = activity.find((a) => a._id === selectedActivityId);
    if (!selected) {
      if (selectedActivities.length) setSelectedActivities([]);
      return;
    }
    setSelectedActivities((prev) =>
      prev.filter((a) => selected.items?.some((it) => it.itemsId === a.itemsId))
    );
  }, [selectedActivityId, activity]);

  const handleMealChange = (item: Item) => {
    setSelectedMeals((prev) => {
      const exists = prev.find((m) => m.itemsId === item.itemsId);
      if (exists) return prev.filter((m) => m.itemsId !== item.itemsId);
      return [...prev, item];
    });
  };

  const handleActivityChange = (item: Item) => {
    setSelectedActivities((prev) => {
      const exists = prev.find((a) => a.itemsId === item.itemsId);
      if (exists) return prev.filter((a) => a.itemsId !== item.itemsId);
      return [...prev, item];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rateplanName) {
      toast.error("Please enter rateplan name.");
      return;
    }

    setSaveLoading(true);
    const selectedMealObj = mealplan.find((m) => m._id === selectedMealId);
    const selectedActivityObj = activity.find((a) => a._id === selectedActivityId);

    const payload = {
      property_id: propertyId,
      roomId: roomId,
      rateplan_name: rateplanName,
      mealplan_name: selectedMealObj?.title || "",
      mealplan: selectedMeals.map((m) => ({
        itemsId: m.itemsId,
        title: m.title,
      })),
      activities_name: selectedActivityObj?.title || "",
      activities: selectedActivities.map((a) => ({
        itemsId: a.itemsId,
        title: a.title,
      })),
      cancellation_policy: cancellationPolicy,
      isSuperPackage: isSuperPackage,
    };

    try {
      const res = await fetch("/api/roomrateplan/add", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Rateplan saved!");
        onAddRateplan?.();
        setTimeout(() => onBack?.(), 1000);
      } else {
        toast.error("Error: " + (data.message || "Failed to save."));
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setSaveLoading(false);
    }
  };

  const selectedMeal = mealplan.find((m) => m._id === selectedMealId);
  const selectedActivity = activity.find((a) => a._id === selectedActivityId);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Add Rateplan</h2>
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="bg-gray-50 text-gray-700 p-3 rounded-lg mb-5 text-sm">
        20% commission will be deducted on bookings for this rateplan.
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rateplan Name */}
        <div>
          <Label htmlFor="rateplan">Rateplan Name <span className="text-red-500">*</span></Label>
          <Input
            list="ratePlans"
            id="rateplan"
            placeholder="Select or type rate plan"
            value={rateplanName}
            onChange={(e) => setRateplanName(e.target.value)}
            required
          />
          <datalist id="ratePlans">
            {rateplan.map((el, idx) => (
              <option key={idx} value={el.title.split("_").join(" ")} />
            ))}
          </datalist>
        </div>

        {/* Mealplan Dropdown */}
        <div>
          <Label>Mealplan Name</Label>
          <Select
            value={selectedMealId}
            onValueChange={(value) => setSelectedMealId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="(Blank / None)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">(Blank / None)</SelectItem>
              {mealplan.map((el, idx) => (
                <SelectItem key={idx} value={el._id}>
                  {el.title.split("_").join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mealplan Checkboxes */}
        {selectedMeal?.items?.length ? (
          <div className="flex flex-wrap gap-3">
            {selectedMeal.items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedMeals.some((m) => m.itemsId === item.itemsId)}
                  onCheckedChange={() => handleMealChange(item)}
                />
                <Label className="text-sm">{item.title.split("_").join(" ")}</Label>
              </div>
            ))}
          </div>
        ) : null}

        {/* Activity Dropdown */}
        <div>
          <Label>Activities Name</Label>
          <Select
            value={selectedActivityId}
            onValueChange={(value) => setSelectedActivityId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="(Blank / None)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">(Blank / None)</SelectItem>
              {activity.map((el, idx) => (
                <SelectItem key={idx} value={el._id}>
                  {el.title.split("_").join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activity Checkboxes */}
        {selectedActivity?.items?.length ? (
          <div className="flex flex-wrap gap-3">
            {selectedActivity.items?.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedActivities.some((a) => a.itemsId === item.itemsId)}
                  onCheckedChange={() => handleActivityChange(item)}
                />
                <Label className="text-sm">{item.title.split("_").join(" ")}</Label>
              </div>
            ))}
          </div>
        ) : null}

        {/* Cancellation Policy */}
        <div className="border-t pt-4">
          <RadioGroup
            value={cancellationPolicy}
            onValueChange={setCancellationPolicy}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free_cancellation" id="freeCancel" />
              <Label htmlFor="freeCancel" className="text-sm">
                Free Cancellation till 24 hours before check-in{" "}
                <span className="text-xs text-green-600 font-medium ml-1">
                  RECOMMENDED
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <RadioGroupItem value="non_refundable" id="nonRefund" />
              <Label htmlFor="nonRefund" className="text-sm">
                Non-Refundable
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="bg-gray-50 border-l-4 border-indigo-500 rounded-md p-3 text-sm">
          If the above listed cancellation policies are not suitable, you can{" "}
          <a href="#" className="text-indigo-600 font-semibold">
            create a new policy
          </a>{" "}
          to assign to this rateplan.
        </div>

        {/* Super Package */}
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isSuperPackage}
            onCheckedChange={(val) => setIsSuperPackage(!!val)}
          />
          <Label className="text-sm">Super Package</Label>
        </div>

        {/* Submit */}
        <div className="text-right">
          <Button type="submit" disabled={saveLoading} className="min-w-40">
            {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save and Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
