"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import type { ItemType } from "@prisma/client";
import type { VocabularyWithHistory } from "@/types";
import { PageShell } from "@/components/ui/PageShell";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { VocabSearchBar } from "@/components/vocabulary/VocabSearchBar";
import { VocabFilterTabs } from "@/components/vocabulary/VocabFilterTabs";
import { VocabSortSelect, type VocabSort } from "@/components/vocabulary/VocabSortSelect";
import { VocabRow } from "@/components/vocabulary/VocabRow";
import { VocabRowSkeleton } from "@/components/vocabulary/VocabRowSkeleton";
import { VocabEditModal } from "@/components/vocabulary/VocabEditModal";
import { DeleteConfirmModal } from "@/components/vocabulary/DeleteConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/apiFetch";

export default function VocabularyPage() {
  const toast = useToast();
  const [items, setItems] = useState<VocabularyWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ItemType | "ALL">("ALL");
  const [sort, setSort] = useState<VocabSort>("newest");
  const [totalWords, setTotalWords] = useState<number | null>(null);
  const [filteredTotal, setFilteredTotal] = useState<number | null>(null);
  const [editing, setEditing] = useState<VocabularyWithHistory | null>(null);
  const [deleting, setDeleting] = useState<VocabularyWithHistory | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | undefined>(undefined);

  const load = useCallback(async () => {
    setSearching(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type !== "ALL") params.set("type", type);
    params.set("sort", sort);
    const res = await fetch(`/api/vocabulary?${params.toString()}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setFilteredTotal(data.total ?? null);
    setLoading(false);
    setSearching(false);
  }, [search, type, sort]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  useEffect(() => {
    fetch("/api/vocabulary?pageSize=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setTotalWords(data?.total ?? null))
      .catch(() => setTotalWords(null));
  }, []);

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
    toast.success("הפריט נשמר");
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    const label = deleting.arabicTranslit;
    const result = await apiFetch(`/api/vocabulary/${deleting.id}`, { method: "DELETE" });
    setSaving(false);
    setDeleting(null);
    if (!result.ok) {
      toast.error(`לא ניתן למחוק את "${label}": ${result.error}`);
      return;
    }
    toast.success(`"${label}" נמחק`);
    load();
  }

  const isFiltered = search !== "" || type !== "ALL";
  const wordCountLabel =
    totalWords === null
      ? null
      : isFiltered
        ? `${filteredTotal ?? 0} מתוך ${totalWords} מילים`
        : totalWords === 1
          ? "מילה אחת"
          : `${totalWords} מילים`;

  return (
    <PageShell>
      <ScreenHeader
        title="אוצר המילים שלי"
        badge={
          wordCountLabel && (
            <span className="inline-flex w-fit items-center rounded-full bg-muted-soft px-2 py-0.5 text-[11px] font-medium text-muted">
              {wordCountLabel}
            </span>
          )
        }
      />
      <div className="mb-4 flex flex-col gap-3">
        <VocabSearchBar value={search} onChange={setSearch} searching={searching && !loading} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <VocabFilterTabs value={type} onChange={setType} />
          <VocabSortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <VocabRowSkeleton key={i} />
          ))}
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
    </PageShell>
  );
}
