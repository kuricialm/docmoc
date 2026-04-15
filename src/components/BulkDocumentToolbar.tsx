import { Button } from '@/components/ui/button';
import { Tag, Trash2 } from 'lucide-react';
import type { Tag as DocTag } from '@/hooks/useTags';

type Props = {
  selectedCount: number;
  tags: DocTag[];
  bulkTagId: string;
  onBulkTagIdChange: (tagId: string) => void;
  onDelete: () => void;
  onApplyTag: () => void;
  onClear: () => void;
};

export default function BulkDocumentToolbar({
  selectedCount,
  tags,
  bulkTagId,
  onBulkTagIdChange,
  onDelete,
  onApplyTag,
  onClear,
}: Props) {
  if (selectedCount <= 0) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 rounded-xl border bg-card px-3 py-3 shadow-lg sm:bottom-6 sm:left-1/2 sm:right-auto sm:w-auto sm:min-w-[620px] sm:max-w-[90vw] sm:-translate-x-1/2 sm:px-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-sm font-medium shrink-0">{selectedCount} selected</span>
        <Button variant="destructive" size="sm" className="gap-1.5 h-8 sm:h-9" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Tag className="hidden sm:block w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <select
            className="h-8 sm:h-9 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm"
            value={bulkTagId}
            onChange={(e) => onBulkTagIdChange(e.target.value)}
          >
            <option value="">Choose tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
          <Button size="sm" variant="secondary" className="h-8 sm:h-9 shrink-0" onClick={onApplyTag} disabled={!bulkTagId}>
            Apply tag
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-8 sm:h-9 shrink-0 ml-auto sm:ml-0" onClick={onClear}>Clear</Button>
      </div>
    </div>
  );
}
