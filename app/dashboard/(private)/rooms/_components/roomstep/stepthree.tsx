"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function StepThree({ setStep, setMaxStepReached, sharedFormData, setSharedFormData }: any) {
  const [bathroomCount, setBathroomCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sharedFormData.StepThree) {
      setBathroomCount(sharedFormData.StepThree.bathroomCount || 0);
    }
  }, [sharedFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (bathroomCount < 1) {
      setError("Please select at least 1 bathroom");
      return;
    }

    setError(null);
    // Save bathroomCount to sharedFormData
    setSharedFormData((prev: any) => ({
      ...prev,
      StepThree: { bathroomCount },
    }));
    setMaxStepReached(4);
    setStep(4);
  };

  const handleBackClick = () => {
    // Save current data before navigating back
    setSharedFormData((prev: any) => ({
      ...prev,
      StepThree: { bathroomCount },
    }));
    setStep(3); // Navigate to StepTwo
  };

  return (
      <Card className='w-full p-3 border-l border-y-0 rounded-none border-r-0 shadow-none'>
        <CardContent className="p-0 pt-6">
          <h3 className="font-normal">Bathroom Details</h3>
          <p className="text-zinc-600 text-sm mb-4">
            Add details of bathroom(s) for this room type
          </p>
          <hr className="my-4" />
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label className="text-lg">
                Specify number of bathroom(s) available
              </Label>

              <div className="flex items-center">
                <div className="w-full xxl:w-6/12 lg:w-5/12 mb-2 lg:mb-0">
                  <p className="text-sm">
                    Specify number of bathroom(s) available
                  </p>
                </div>
                <div className="w-full xxl:w-2/12 lg:w-4/12 md:w-3/12">
                  <div className="flex">
                    <Button
                      variant="outline"
                      type="button"
                      size="sm"
                      onClick={() => setBathroomCount((prev) => Math.max(0, prev - 1))}
                      className="h-10 px-3"
                    >
                      -
                    </Button>
                    <Input
                      className="text-center  h-10 flex-1 mx-2 border-x-0"
                      type="number"
                      readOnly
                      value={bathroomCount}
                    />
                    <Button
                      variant="outline"
                      type="button"
                      size="sm"
                      onClick={() => setBathroomCount((prev) => prev + 1)}
                      className="h-10 px-3"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-destructive mt-2 text-xs font-medium">
                  {error}
                </p>
              )}
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" size="lg" type="button" onClick={handleBackClick}>
                Back
              </Button>
              <Button type="submit" size="lg">
                Next
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
  );
}