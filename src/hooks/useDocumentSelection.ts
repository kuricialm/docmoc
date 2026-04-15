import { useEffect, useMemo, useState } from 'react';
import type { Document } from '@/hooks/useDocuments';

export function useDocumentSelection(documents: Document[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds((previous) => {
      if (previous.size === 0) return previous;

      const liveIds = new Set(documents.map((doc) => doc.id));
      let changed = false;
      const next = new Set<string>();

      for (const id of previous) {
        if (liveIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      }

      return changed ? next : previous;
    });
  }, [documents]);

  const selectedDocuments = useMemo(
    () => documents.filter((doc) => selectedIds.has(doc.id)),
    [documents, selectedIds],
  );

  const toggleSelection = (doc: Pick<Document, 'id'>) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(doc.id)) {
        next.delete(doc.id);
      } else {
        next.add(doc.id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    selectedDocuments,
    toggleSelection,
    clearSelection,
  };
}
