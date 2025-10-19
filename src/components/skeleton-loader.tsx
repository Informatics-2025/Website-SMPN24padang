
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonLoader() {
    return (
        <div className="container mx-auto py-6">
            <div className="space-y-8 animate-pulse">
                {/* Page Title Skeleton */}
                <div>
                    <Skeleton className="h-9 w-1/3 rounded-md" />
                    <Skeleton className="mt-2 h-5 w-1/2 rounded-md" />
                </div>

                {/* Grid of generic cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="space-y-4">
                            <Skeleton className="h-48 w-full rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
