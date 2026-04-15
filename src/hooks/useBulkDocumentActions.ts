import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '@/lib/api';
import type { Document } from '@/hooks/useDocuments';

export function useBulkDocumentActions() {
  const queryClient = useQueryClient();

  const invalidateDocuments = async () => {
    await queryClient.invalidateQueries({ queryKey: ['documents'] });
  };

  const bulkDelete = async (documents: Document[]) => {
    if (documents.length === 0) return;

    await Promise.all(documents.map((doc) => api.trashDocument(doc.id)));
    await invalidateDocuments();
    toast.success(`Moved ${documents.length} document(s) to trash`);
  };

  const bulkTag = async (documents: Document[], tagId: string) => {
    if (!tagId || documents.length === 0) return;

    await Promise.all(documents.map((doc) => api.addTagToDocument(doc.id, tagId)));
    await invalidateDocuments();
    toast.success(`Tagged ${documents.length} document(s)`);
  };

  return { bulkDelete, bulkTag };
}
