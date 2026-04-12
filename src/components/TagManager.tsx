import { useState } from 'react';
import { Document } from '@/hooks/useDocuments';
import { useTags, useTagMutations } from '@/hooks/useTags';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Plus, X } from 'lucide-react';

const TAG_COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

type Props = {
  document: Document | null;
  open: boolean;
  onClose: () => void;
};

export default function TagManager({ document: doc, open, onClose }: Props) {
  const { data: tags } = useTags();
  const { createTag, addTagToDocument, removeTagFromDocument } = useTagMutations();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [showCreate, setShowCreate] = useState(false);

  if (!doc) return null;
  const docTagIds = doc.tags?.map((t) => t.id) || [];

  const handleToggleTag = (tagId: string) => {
    if (docTagIds.includes(tagId)) {
      removeTagFromDocument.mutate({ documentId: doc.id, tagId });
    } else {
      addTagToDocument.mutate({ documentId: doc.id, tagId });
    }
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTag.mutate({ name: newTagName.trim(), color: newTagColor });
    setNewTagName('');
    setShowCreate(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {tags?.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleToggleTag(tag.id)}
              className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-secondary transition-colors"
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
              <span className="text-sm flex-1 text-left">{tag.name}</span>
              {docTagIds.includes(tag.id) && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}

          {showCreate ? (
            <div className="space-y-2 pt-2 border-t">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
                className="h-8 text-sm"
                autoFocus
              />
              <div className="flex gap-1.5">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewTagColor(c)}
                    className="w-6 h-6 rounded-full border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: c === newTagColor ? 'hsl(var(--foreground))' : 'transparent' }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateTag} className="flex-1">Create</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-secondary transition-colors text-sm text-muted-foreground"
            >
              <Plus className="w-4 h-4" /> Create new tag
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
