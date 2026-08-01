import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight } from "@medusajs/icons";
import { Badge, Button, Container, Heading, Table, Text } from "@medusajs/ui";
import { useCallback, useEffect, useState } from "react";

/**
 * Адмін-сторінка «Контент ANKE»: модерація відгуків + банери головної.
 * Працює через /admin/anke/entries (сесія адмінки).
 */

type Entry = {
  id: string;
  type: string;
  ref: string | null;
  status: string;
  data: Record<string, unknown>;
  created_at: string;
};

const AnkeContentPage = () => {
  const [reviews, setReviews] = useState<Entry[]>([]);
  const [banners, setBanners] = useState<Entry[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [r, b] = await Promise.all([
      fetch("/admin/anke/entries?type=review", { credentials: "include" }).then((x) => x.json()),
      fetch("/admin/anke/entries?type=banner", { credentials: "include" }).then((x) => x.json()),
    ]);
    setReviews(r.entries ?? []);
    setBanners(b.entries ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    await fetch(`/admin/anke/entries/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    void load();
  };

  const remove = async (id: string) => {
    setBusy(id);
    await fetch(`/admin/anke/entries/${id}`, { method: "DELETE", credentials: "include" });
    setBusy(null);
    void load();
  };

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Контент ANKE</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Модерація відгуків і банери головної. SEO-поля товарів/категорій редагуються в їх metadata
          (seoTitle, seoDescription, ogImage, noindex).
        </Text>
      </div>

      <div className="px-6 py-4">
        <Heading level="h2">Відгуки на модерації</Heading>
        <Table className="mt-3">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Товар</Table.HeaderCell>
              <Table.HeaderCell>Автор</Table.HeaderCell>
              <Table.HeaderCell>Оцінка</Table.HeaderCell>
              <Table.HeaderCell>Текст</Table.HeaderCell>
              <Table.HeaderCell>Статус</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reviews.length === 0 && (
              <Table.Row>
                <Table.Cell>
                  <Text size="small">Відгуків поки немає.</Text>
                </Table.Cell>
              </Table.Row>
            )}
            {reviews.map((e) => (
              <Table.Row key={e.id}>
                <Table.Cell>{e.ref}</Table.Cell>
                <Table.Cell>{String(e.data.author ?? "")}</Table.Cell>
                <Table.Cell>{"★".repeat(Number(e.data.rating ?? 0))}</Table.Cell>
                <Table.Cell className="max-w-90 truncate">{String(e.data.text ?? "")}</Table.Cell>
                <Table.Cell>
                  <Badge color={e.status === "approved" ? "green" : e.status === "pending" ? "orange" : "red"}>
                    {e.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    {e.status !== "approved" && (
                      <Button size="small" isLoading={busy === e.id} onClick={() => setStatus(e.id, "approved")}>
                        Схвалити
                      </Button>
                    )}
                    {e.status !== "rejected" && (
                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={busy === e.id}
                        onClick={() => setStatus(e.id, "rejected")}
                      >
                        Відхилити
                      </Button>
                    )}
                    <Button size="small" variant="danger" isLoading={busy === e.id} onClick={() => remove(e.id)}>
                      Видалити
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="px-6 py-4">
        <Heading level="h2">Банери головної</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Створюються через POST /admin/anke/entries (type: banner, data: title/subtitle/image/href).
          Сторфронт показує схвалені банери; без жодного — використовує дефолтний hero.
        </Text>
        <Table className="mt-3">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Заголовок</Table.HeaderCell>
              <Table.HeaderCell>Посилання</Table.HeaderCell>
              <Table.HeaderCell>Статус</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {banners.length === 0 && (
              <Table.Row>
                <Table.Cell>
                  <Text size="small">Банерів немає — сторфронт показує дефолтний hero.</Text>
                </Table.Cell>
              </Table.Row>
            )}
            {banners.map((e) => (
              <Table.Row key={e.id}>
                <Table.Cell>{String(e.data.title ?? "")}</Table.Cell>
                <Table.Cell>{String(e.data.href ?? "")}</Table.Cell>
                <Table.Cell>
                  <Badge color={e.status === "approved" ? "green" : "orange"}>{e.status}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      isLoading={busy === e.id}
                      onClick={() => setStatus(e.id, e.status === "approved" ? "pending" : "approved")}
                    >
                      {e.status === "approved" ? "Сховати" : "Показати"}
                    </Button>
                    <Button size="small" variant="danger" isLoading={busy === e.id} onClick={() => remove(e.id)}>
                      Видалити
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Контент ANKE",
  icon: ChatBubbleLeftRight,
});

export default AnkeContentPage;
