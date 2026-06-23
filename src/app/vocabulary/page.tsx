"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import type { ItemType } from "@prisma/client";
import type { VocabularyWithHistory } from "@/types";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { VocabSearchBar } from "@/components/vocabulary/VocabSearchBar";
import { VocabFilterTabs } from "@/components/vocabulary/VocabFilterTabs";
import { VocabRow } from "@/components/vocabulary/VocabRow";
import { VocabEditModal } from "@/components/vocabulary/VocabEditModal";
import { DeleteConfirmModal } from "@/components/vocabulary/DeleteConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabularyWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ItemType | "ALL">("ALL");
  const [editing, setEditing] = useState<VocabularyWithHistory | null>(null);
  const [deleting, setDeleting] = useState<VocabularyWithHistory | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type !== "ALL") params.set("type", type);
    const res = await fetch(`/api/vocabulary?${params.toString()}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, [search, type]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleSave(data: { arabicTranslit: string; hebrewMeaning: string; itemType: ItemType }) {
    if (!editing) return;
    setSaving(true);
    setEditError(undefined);
    const res = await fetch(`/api/vocabulary/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setEditError(body.error ?? "שגיאה בשמירה");
      return;
    }
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    await fetch(`/api/vocabulary/${deleting.id}`, { method: "DELETE" });
    setSaving(false);
    setDeleting(null);
    load();
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-4 pb-10">
      <ScreenHeader title="אוצר המילים שלי" />
      <div className="mb-4 flex flex-col gap-3">
        <VocabSearchBar value={search} onChange={setSearch} />
        <VocabFilterTabs value={type} onChange={setType} />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="size-6 text-primary" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={search || type !== "ALL" ? "לא נמצאו תוצאות" : "עדיין אין מילים באוצר"}
          description={search || type !== "ALL" ? "נסה/י חיפוש אחר" : "התחל/י בהוספת מילים חדשות"}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <VocabRow
              key={item.id}
              item={item}
              onEdit={() => setEditing(item)}
              onDelete={() => setDeleting(item)}
            />
          ))}
        </div>
      )}

      {editing && (
        <VocabEditModal
          initial={editing}
          onSave={handleSave}
          onCancel={() => {
            setEditing(null);
            setEditError(undefined);
          }}
          loading={saving}
          error={editError}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          itemLabel={deleting.arabicTranslit}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={saving}
        />
      )}
    </main>
  );
}
