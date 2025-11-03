import { Skeleton } from "@/components/ui/skeleton";

const InventorySkeleton = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen bg-background mx-auto max-w-7xl">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex rounded-md border overflow-hidden">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-32" />
        <div className="flex border rounded-md overflow-hidden">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="p-4">
          <div className="flex items-center">
            <div className="w-1/4">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex-1 flex justify-between">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <Skeleton className="h-3 w-6" />
                  <Skeleton className="h-6 w-6 mt-1" />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, roomIndex) => (
            <div key={roomIndex}>
              <div className="flex border rounded-md mb-2 overflow-hidden">
                <div className="w-1/4 bg-background border-r p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div key={idx} className="flex-1 p-2">
                    <div className="border-2 border-dashed rounded-md p-3">
                      <Skeleton className="h-4 w-8 mx-auto mb-2" />
                      <Skeleton className="h-8 w-16 mx-auto" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
              {Array.from({ length: 2 }).map((_, planIndex) => (
                <div key={planIndex} className="border rounded-md p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-1/4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20 mt-1" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                    <div className="w-3/4 grid grid-cols-7 gap-2">
                      {Array.from({ length: 7 }).map((_, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          <Skeleton className="h-10 w-16" />
                          <Skeleton className="h-10 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
};

export default InventorySkeleton;