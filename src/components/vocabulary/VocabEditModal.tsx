"use client";

import { useState } from "react";
import type { ItemType } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ItemTypeSelector } from "@/components/ui/ItemTypeSelector";

export function VocabEditModal({
  initial,
  onSave,
  onCancel,
  loading,
  error,
}: {
  initial: { arabicTranslit: string; hebrewMeaning: string; itemType: ItemType };
  onSave: (data: { arabicTranslit: string; hebrewMeaning: string; itemType: ItemType }) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}) {
  const [arabicTranslit, setArabicTranslit] = useState(initial.arabicTranslit);
  const [hebrewMeaning, setHebrewMeaning] = useState(initial.hebrewMeaning);
  const [itemType, setItemType] = useState<ItemType>(initial.itemType);

  return (
    <Modal
      title="עריכת פריט"
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            ביטול
          </Button>
          <Button
            onClick={() => onSave({ arabicTranslit, hebrewMeaning, itemType })}
            loading={loading}
            disabled={!arabicTranslit.trim() || !hebrewMeaning.trim()}
          >
            שמירה
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <TextField
          value={arabicTranslit}
          onChange={(e) => setArabicTranslit(e.target.value)}
          placeholder="תעתיק בעברית"
          error={error}
        />
        <TextField
          value={hebrewMeaning}
          onChange={(e) => setHebrewMeaning(e.target.value)}
          placeholder="פירוש בעברית"
        />
        <ItemTypeSelector value={itemType} onChange={setItemType} />
      </div>
    </Modal>
  );
}
