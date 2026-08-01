import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <Container className="py-6 md:py-10">
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <div className="flex gap-3">
          <div className="hidden w-20 flex-col gap-3 lg:flex">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
          <Skeleton className="aspect-[3/4] flex-1" />
        </div>
        <div>
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="mt-4 h-6 w-28" />
          <Skeleton className="mt-8 h-10 w-56" />
          <Skeleton className="mt-6 h-12 w-full" />
          <Skeleton className="mt-8 h-40 w-full" />
        </div>
      </div>
    </Container>
  );
}
