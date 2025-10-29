// components/propertymanagement/property/manageinventory/model/RateModel.tsx
"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckedState } from "@radix-ui/react-checkbox";

interface Props {
  showRateModal: boolean;
  setShowRateModal: Dispatch<SetStateAction<boolean>>;
}

const RateModel: React.FC<Props> = ({ showRateModal, setShowRateModal }) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showNettRate, setShowNettRate] = useState<CheckedState>(false);
  const [blockRate, setBlockRate] = useState<CheckedState>(false);
  const [unblockRate, setUnblockRate] = useState<CheckedState>(true);
  const [minStay, setMinStay] = useState("");

  const days = ["M", "T", "W", "T", "F", "S", "S"];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    // Implement save logic here
    setShowRateModal(false);
  };

  return (
    <Dialog open={showRateModal} onOpenChange={setShowRateModal}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 pb-4 bg-muted/50 rounded-t-lg">
          <DialogTitle className="text-2xl font-medium">
            Manage Rate - SMAP - Super Package
            <span className="text-muted-foreground ml-2 text-lg">(B2C)</span>
          </DialogTitle>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase text-muted-foreground">
                Select dates to update inventory for *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
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
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase text-muted-foreground">
                Selected days ({days.length})
              </Label>
              <div className="flex gap-1">
                {days.map((d, i) => (
                  <Button
                    key={i}
                    variant={selectedDays.includes(d) ? "default" : "outline"}
                    className="h-10 w-10 rounded"
                    onClick={() => toggleDay(d)}
                  >
                    {d}
                  </Button>
                ))}
              </div>
              <div className="mt-2">
                <Checkbox
                  id="showNettRate"
                  checked={showNettRate}
                  onCheckedChange={setShowNettRate}
                >
                  <Label htmlFor="showNettRate" className="text-sm font-medium">
                    Show Nett Rate
                  </Label>
                </Checkbox>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Alert className="mx-6 mt-4 rounded-none border-t-0">
          <AlertDescription className="text-xs text-muted-foreground">
            Please note, if you have not set rates for any occupancy, next higher available occupancy rates would be picked.
          </AlertDescription>
        </Alert>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h6 className="text-lg font-semibold">Base Rates:</h6>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center p-2 border rounded">
                  <div className="flex items-center">
                    <span className="text-lg font-bold mr-1">2</span>
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Base</span>
                </div>
                <Input type="number" placeholder="₹ Enter" className="flex-1" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center p-2 border rounded">
                  <div className="flex items-center">
                    <span className="text-lg font-bold mr-1">1</span>
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Extra</span>
                </div>
                <Input type="number" placeholder="₹ Enter" className="flex-1" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Button variant="link" className="h-auto p-0 text-primary">
              + Extra Adult & Child Rates
            </Button>
            <div className="flex-1 h-px bg-muted" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Free Child Rate (0 - 6 years)</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted rounded-l-md border border-r-0">
                  ₹
                </span>
                <Input
                  value="Free"
                  readOnly
                  disabled
                  className="rounded-l-none bg-muted text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Paid Child Rate (7 - 12 years)</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-background rounded-l-md border border-r-0">
                  ₹
                </span>
                <Input type="number" placeholder="Enter" className="rounded-l-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Button variant="link" className="h-auto p-0 text-primary">
              + Update Rate Restrictions
            </Button>
            <div className="flex-1 h-px bg-muted" />
          </div>

          <div className="space-y-4">
            <div className="flex border rounded-md overflow-hidden">
              <div className="flex-1 border-r p-3">
                <Checkbox
                  id="blockRate"
                  checked={blockRate}
                  onCheckedChange={setBlockRate}
                >
                  <Label htmlFor="blockRate" className="text-sm">
                    Block Rate
                  </Label>
                </Checkbox>
              </div>
              <div className="flex-1 p-3">
                <Checkbox
                  id="unblockRate"
                  checked={unblockRate}
                  onCheckedChange={setUnblockRate}
                >
                  <Label htmlFor="unblockRate" className="text-sm">
                    Unblock Rate
                  </Label>
                </Checkbox>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Set Minimum length of stay</Label>
              <Input
                type="number"
                placeholder="Enter"
                value={minStay}
                onChange={(e) => setMinStay(e.target.value)}
                className="w-48"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4 rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => setShowRateModal(false)}
            className="font-medium"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="font-medium">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RateModel;