
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditStepThree({ id, setSharedFormData }: any) {
  const [bathroomCount, setBathroomCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/rooms/get/${id}`);
        const { data } = await res.json();
        if (data?.bathroomCount) {
          setBathroomCount(data.bathroomCount);
          setSharedFormData((prev: any) => ({ ...prev, StepThree: { bathroomCount: data.bathroomCount } }));
        }
      } catch {}
    })();
  }, [id, setSharedFormData]);

  function handleSave() {
    if (bathroomCount < 1) {
      setError("Please select at least 1 bathroom");
      return;
    }
    setError(null);
    setSharedFormData((prev: any) => ({ ...prev, StepThree: { bathroomCount } }));
    setOpen(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold">Bathroom Details</h4>
        {!open && (
          <Button variant="link" className="px-0" onClick={() => setOpen(true)}>
            Edit
          </Button>
        )}
      </div>
      <div className="border-t my-3" />

      {!open ? (
        <div className="px-1 py-2 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-muted-foreground text-[12px] font-semibold">Bathroom Details</div>
            <div className="font-semibold">{bathroomCount}</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="font-semibold">Specify number of bathroom(s) available</label>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setBathroomCount((p) => Math.max(0, p - 1))}>-</Button>
            <Input readOnly value={bathroomCount} className="w-24 text-center" />
            <Button variant="outline" onClick={() => setBathroomCount((p) => p + 1)}>+</Button>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}
