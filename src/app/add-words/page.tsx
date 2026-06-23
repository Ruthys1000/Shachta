"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { ParsedVocabItem, BulkVocabConflict, BulkVocabItem, DuplicateResolution } from "@/types";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { ParseInputForm } from "@/components/add-words/ParseInputForm";
import { ConfirmTable } from "@/components/add-words/ConfirmTable";
import { DuplicateDialog } from "@/components/add-words/DuplicateDialog";

type Phase = "input" | "confirm" | "done";

export default function AddWordsPage() {
  const [phase, setPhase] = useState<Phase>("input");
  const [rawText, setRawText] = useState("");
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState<string | undefined>(undefined);

  const [items, setItems] = useState<ParsedVocabItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);

  const [conflicts, setConflicts] = useState<BulkVocabConflict[]>([]);
  const [conflictIndex, setConflictIndex] = useState(0);
  const [resolutions, setResolutions] = useState<Map<string, DuplicateResolution>>(new Map());

  const [savedCount, setSavedCount] = useState(0);

  async function handleParse() {
    setParseLoading(true);
    setParseError(undefined);
    const res = await fetch("/api/vocabulary/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: rawText }),
    });
    setParseLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setParseError(body.error ?? "שגיאה בניתוח הטקסט");
      return;
    }
    const data = await res.json();
    setItems(data.items ?? []);
    setPhase("confirm");
  }

  function updateItem(next: ParsedVocabItem) {
    setItems((prev) => prev.map((it) => (it.tempId === next.tempId ? next : it)));
  }

  function deleteItem(tempId: string) {
    setItems((prev) => prev.filter((it) => it.tempId !== tempId));
  }

  async function submitBulk(toSubmit: BulkVocabItem[]) {
    const res = await fetch("/api/vocabulary/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: toSubmit }),
    });
    return res;
  }

  async function handleSave() {
    if (items.length === 0) return;
    setSaving(true);
    setSaveError(undefined);
    const payload: BulkVocabItem[] = items.map((item) => ({
      tempId: item.tempId,
      arabicTranslit: item.arabicTranslit,
      hebrewMeaning: item.hebrewMeaning,
      itemType: item.itemType,
      resolution: null,
    }));
    const res = await submitBulk(payload);
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setSaveError(body.error ?? "שגיאה בשמירה");
      return;
    }
    const data = await res.json();
    if (data.conflicts?.length > 0) {
      setConflicts(data.conflicts);
      setConflictIndex(0);
      setResolutions(new Map());
      setSavedCount(data.saved ?? 0);
    } else {
      setSavedCount(data.saved ?? 0);
      setPhase("done");
    }
  }

  async function handleResolve(resolution: DuplicateResolution) {
    const current = conflicts[conflictIndex];
    const nextResolutions = new Map(resolutions);
    nextResolutions.set(current.tempId, resolution);

    if (conflictIndex + 1 < conflicts.length) {
      setResolutions(nextResolutions);
      setConflictIndex(conflictIndex + 1);
      return;
    }

    setSaving(true);
    const payload: BulkVocabItem[] = conflicts.map((c) => ({
      tempId: c.tempId,
      arabicTranslit: c.arabicTranslit,
      hebrewMeaning: c.hebrewMeaning,
      itemType: c.itemType,
      resolution: nextResolutions.get(c.tempId) ?? "skip",
    }));
    const res = await submitBulk(payload);
    setSaving(false);
    const data = await res.json().catch(() => ({ saved: 0 }));
    setSavedCount((prev) => prev + (data.saved ?? 0));
    setConflicts([]);
    setPhase("done");
  }

  function handleReset() {
    setPhase("input");
    setRawText("");
    setItems([]);
    setSaveError(undefined);
    setParseError(undefined);
    setConflicts([]);
    setSavedCount(0);
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-4 pb-10">
      <ScreenHeader title="הוספת מילים" />

      {phase === "input" && (
        <ParseInputForm
          value={rawText}
          onChange={setRawText}
          onSubmit={handleParse}
          loading={parseLoading}
          error={parseError}
        />
      )}

      {phase === "confirm" && (
        <div className="flex flex-col gap-4">
          <ConfirmTable items={items} onChange={updateItem} onDelete={deleteItem} />
          {saveError && <p className="text-sm text-danger">{saveError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleReset}>
              ביטול
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={items.length === 0}>
              שמירת {items.length} פריטים
            </Button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-success/30 bg-success-soft px-6 py-12 text-center">
          <CheckCircle2 className="size-10 text-success" />
          <p className="text-base font-medium">נשמרו {savedCount} פריטים באוצר המילים</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleReset}>
              הוספת מילים נוספות
            </Button>
            <Link href="/vocabulary">
              <Button>למאגר אוצר המילים</Button>
            </Link>
          </div>
        </div>
      )}

      {conflicts.length > 0 && conflictIndex < conflicts.length && (
        <DuplicateDialog
          conflict={conflicts[conflictIndex]}
          index={conflictIndex}
          total={conflicts.length}
          onResolve={handleResolve}
        />
      )}
    </main>
  );
}
