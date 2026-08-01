/** Скелетон із shimmer-ефектом (анімація тільки transform — без CLS). */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-beige ${className}`} aria-hidden="true">
      <div className="anke-shimmer absolute inset-0" />
    </div>
  );
}
