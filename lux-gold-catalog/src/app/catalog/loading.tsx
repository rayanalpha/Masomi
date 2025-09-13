import Skeleton from "@/components/ui/Skeleton";

export default function LoadingCatalog() {
  return (
    <div className="container py-10">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-elegant">
            <Skeleton className="h-44 sm:h-60 w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-40" muted />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
