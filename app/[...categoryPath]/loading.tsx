import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

/** Скелетон каталогу з shimmer (розміри зарезервовані — нуль CLS). */
export default function CatalogLoading() {
  return (
    <Container className="py-6 md:py-10">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-6 h-10 w-64" />
      <div className="mt-8 border-y border-line py-3">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-1.5 h-4 w-16" />
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
