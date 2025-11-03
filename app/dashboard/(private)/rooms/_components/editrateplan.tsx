"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EditRateplanSkeleton from "./rateplanskeliton";

interface EditRateplansProps {
  roomId: string;
  onBack: () => void;
}

interface MealOrActivityItem {
  itemsId: string;
  title: string;
}

export default function EditRateplans({ roomId, onBack }: EditRateplansProps) {
  const [rateplanList, setRateplanList] = useState<any[]>([]);
  const [mealplan, setMealplan] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  const [rateplanName, setRateplanName] = useState("");
  const [selectedMealId, setSelectedMealId] = useState("");
  const [selectedMeals, setSelectedMeals] = useState<MealOrActivityItem[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<MealOrActivityItem[]>([]);

  const [cancellationPolicy, setCancellationPolicy] = useState("free_cancellation");
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [isSuperPackage, setIsSuperPackage] = useState<boolean>(false);

  const selectedMeal = mealplan.find((m: any) => m._id === selectedMealId);
  const selectedActivity = activity.find((a: any) => a._id === selectedActivityId);

  const handleMealChange = (item: MealOrActivityItem) => {
    setSelectedMeals((prev) =>
      prev.find((m) => m.itemsId === item.itemsId)
        ? prev.filter((m) => m.itemsId !== item.itemsId)
        : [...prev, item]
    );
  };

  const handleActivityChange = (item: MealOrActivityItem) => {
    setSelectedActivities((prev) =>
      prev.find((a) => a.itemsId === item.itemsId)
        ? prev.filter((a) => a.itemsId !== item.itemsId)
        : [...prev, item]
    );
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const [ratePlanRes, mealsmasterRes, activityRes] = await Promise.all([
        fetch("/api/plan/get"),
        fetch("/api/mealsmaster/get"),
        fetch("/api/activitymaster/get"),
      ]);
      setRateplanList((await ratePlanRes.json()).data || []);
      setMealplan((await mealsmasterRes.json()).data || []);
      setActivity((await activityRes.json()).data || []);
      setLoading(false);
      setLoadingData(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRateplan = async () => {
      if (!roomId || loadingData) return;

      const res = await fetch(`/api/roomrateplan/get/${roomId}`);
      const json = await res.json();

      if (json.success) {
        const rp = json.data;
        setRateplanName(rp.rateplan_name || "");
        setSelectedMeals(rp.mealplan || []);
        setSelectedActivities(rp.activities || []);
        setCancellationPolicy(rp.cancellation_policy || "free_cancellation");
        setIsSuperPackage(!!rp.isSuperPackage);

        const selMeal = mealplan.find((m) => m.title === rp.mealplan_name);
        const selAct = activity.find((a) => a.title === rp.activities_name);
        setSelectedMealId(selMeal?._id || "");
        setSelectedActivityId(selAct?._id || "");

        setLoading(false);
      }
    };
    fetchRateplan();
  }, [roomId, loadingData, mealplan, activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rateplanName || !selectedMealId || !selectedActivityId) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      rateplan_name: rateplanName,
      mealplan_name: selectedMeal?.title || "",
      mealplan: selectedMeals.map((m) => ({ itemsId: m.itemsId, title: m.title })),
      activities_name: selectedActivity?.title || "",
      activities: selectedActivities.map((a) => ({ itemsId: a.itemsId, title: a.title })),
      cancellation_policy: cancellationPolicy,
      isSuperPackage: isSuperPackage,
    };

    const res = await fetch(`/api/roomrateplan/update/${roomId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.success) {
      toast.success("Rateplan updated successfully");
      setTimeout(() => onBack?.(), 1000);
    } else {
      toast.error(data?.message || "Failed to update rateplan");
    }
  };

  return (
    <>
      {loadingData && loading ? (
        <EditRateplanSkeleton />
      ) : (
        <Card className="p-6 shadow-lg border border-gray-200 rounded-2xl">
          <CardContent>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <h4 className="text-xl font-semibold">Edit Rateplan</h4>
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2 font-medium"
              >
                <ArrowLeft size={14} /> Back
              </Button>
            </div>
            <hr className="mb-6" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rateplan Name */}
              <div>
                <Label>
                  Rateplan Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  list="ratePlans"
                  placeholder="Select or type rate plan"
                  value={rateplanName}
                  onChange={(e) => setRateplanName(e.target.value)}
                />
                <datalist id="ratePlans">
                  {rateplanList.map((el, index) => (
                    <option key={index} value={el.title.split("_").join(" ")} />
                  ))}
                </datalist>
              </div>

              {/* Mealplan */}
              <div>
                <Label>
                  Mealplan Name <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedMealId}
                  onValueChange={(val) => setSelectedMealId(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a meal plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealplan
                      .filter((el: any) => typeof el?._id === "string" && el._id.trim() !== "" && el.title)
                      .map((el: any) => (
                        <SelectItem key={el._id} value={el._id}>
                          {el.title.split("_").join(" ")}
                        </SelectItem>
                      ))}
                  </SelectContent>


                </Select>
              </div>

              {/* Mealplan Items */}
              {selectedMeal?.items?.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {selectedMeal.items.map((item: any) => (
                    <div key={item.itemsId} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.itemsId}
                        checked={selectedMeals.some((m) => m.itemsId === item.itemsId)}
                        onCheckedChange={() => handleMealChange(item)}
                      />
                      <Label htmlFor={item.itemsId}>
                        {item.title.split("_").join(" ")}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity */}
              <div>
                <Label>
                  Activity Name <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedActivityId}
                  onValueChange={(val) => setSelectedActivityId(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activity
                      .filter((el: any) => typeof el?._id === "string" && el._id.trim() !== "" && el.title)
                      .map((el: any) => (
                        <SelectItem key={el._id} value={el._id}>
                          {el.title.split("_").join(" ")}
                        </SelectItem>
                      ))}
                  </SelectContent>


                </Select>
              </div>

              {/* Activity Items */}
              {selectedActivity?.items?.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {selectedActivity.items.map((item: any) => (
                    <div key={item.itemsId} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.itemsId}
                        checked={selectedActivities.some((a) => a.itemsId === item.itemsId)}
                        onCheckedChange={() => handleActivityChange(item)}
                      />
                      <Label htmlFor={item.itemsId}>
                        {item.title.split("_").join(" ")}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="border-t pt-4">
                <Label className="font-semibold mb-2 block">
                  Cancellation Policy <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={cancellationPolicy}
                  onValueChange={setCancellationPolicy}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="non_refundable" id="non_refundable" />
                    <Label htmlFor="non_refundable">Non-Refundable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free_cancellation" id="free_cancellation" />
                    <Label htmlFor="free_cancellation" className="flex items-center gap-2">
                      Free Cancellation till 24 hrs before check-in{" "}
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        RECOMMENDED
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Super Package */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="super_package"
                  checked={isSuperPackage}
                  onCheckedChange={(checked) => setIsSuperPackage(!!checked)}
                />
                <Label htmlFor="super_package" className="font-medium">
                  Super Package
                </Label>
              </div>

              <div className="text-end">
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                  Save and Continue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
