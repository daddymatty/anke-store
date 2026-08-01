import Link from "next/link";
import type { ReactNode } from "react";

/** Міні-рендер [текст](/шлях) → <Link> для абзаців контенту (без зовнішніх лібок). */
export function renderParagraph(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={key++} href={m[2]} className="text-ink underline underline-offset-4 hover:text-rose-deep">
        {m[1]}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
