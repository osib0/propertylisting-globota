"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EditRateplanSkeleton() {
  return (
    <Card className="p-6 shadow-md border border-gray-200 rounded-2xl">
      <CardContent className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h4 className="text-xl font-semibold">
            <Skeleton className="h-6 w-44" />
          </h4>
          <Button variant="outline" disabled className="flex items-center justify-center">
            <Skeleton className="h-5 w-16" />
          </Button>
        </div>

        <hr className="border-gray-200" />

        {/* Sub header */}
        <div className="bg-gray-100 p-3 rounded-md text-sm">
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Form fields */}
        <div className="space-y-5">
          <div>
            <Skeleton className="h-4 w-36 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Mealplan items */}
          <div>
            <Skeleton className="h-4 w-28 mb-3" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
          </div>

          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Activity items */}
          <div>
            <Skeleton className="h-4 w-28 mb-3" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
          </div>

          {/* Cancellation policy */}
          <div className="border-t border-gray-200 pt-4">
            <Skeleton className="h-4 w-40 mb-3" />
            <Skeleton className="h-5 w-60 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>

          {/* Submit button */}
          <div className="text-end mt-6">
            <Skeleton className="h-10 w-36 rounded-md inline-block" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
