import { Skeleton } from "@/components/ui/skeleton";

export function KudoSkeletonGrid() {
  return (
    <div className="columns-1 gap-4 md:columns-2 lg:columns-3" aria-busy="true" aria-label="불러오는 중">
      {[120, 160, 100, 140, 180, 110].map((h, i) => (
        <Skeleton key={i} className="mb-4 break-inside-avoid rounded-xl" style={{ height: h }} />
      ))}
    </div>
  );
}
