import type { CategoryNode } from "@/lib/catalog/types";

/** Модель навігації хедера, побудована з дерева категорій каталогу. */

export type NavColumn = {
  title: string;
  href: string;
  items: { title: string; href: string }[];
};

export type NavEntry = {
  title: string;
  href: string;
  accent?: boolean;
  columns?: NavColumn[];
};

const hrefOf = (n: CategoryNode) => `/${n.path.join("/")}`;

export function buildNav(tree: CategoryNode[]): NavEntry[] {
  const entries: NavEntry[] = tree.map((top) => ({
    title: top.title,
    href: hrefOf(top),
    columns: top.children.length
      ? top.children.map((child) => ({
          title: child.title,
          href: hrefOf(child),
          items: child.children.map((leaf) => ({ title: leaf.title, href: hrefOf(leaf) })),
        }))
      : undefined,
  }));
  entries.push({ title: "Новинки", href: "/novynky" });
  entries.push({ title: "SALE", href: "/sale", accent: true });
  return entries;
}
