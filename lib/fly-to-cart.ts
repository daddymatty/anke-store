"use client";

/**
 * Flying-image: клон фото товару летить до іконки кошика (розділ 6).
 * Чистий WAAPI (transform + opacity), поважає prefers-reduced-motion.
 */
export function flyToCart(sourceImg: HTMLElement | null): void {
  if (!sourceImg || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cartIcon = document.querySelector<HTMLElement>('button[aria-label^="Кошик"]');
  if (!cartIcon) return;

  const from = sourceImg.getBoundingClientRect();
  const to = cartIcon.getBoundingClientRect();
  if (!from.width || !to.width) return;

  const clone = sourceImg.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    margin: "0",
    zIndex: "80",
    pointerEvents: "none",
    objectFit: "cover",
    borderRadius: "4px",
  });
  document.body.appendChild(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const anim = clone.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(0.4)`, opacity: 0.9 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.4 },
    ],
    { duration: 600, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" },
  );
  anim.onfinish = () => clone.remove();
}
