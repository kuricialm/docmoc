import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export type Document = {
  id: string;
  user_id: string;
  name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  starred: boolean;
  trashed: boolean;
  trashed_at: string | null;
  shared: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
  tags?: { id: string; name: string; color: string }[];
};

export function useDocuments(filter?: {
  trashed?: boolean;
  starred?: boolean;
  shared?: boolean;
  tagId?: string;
  recent?: boolean;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['documents', user?.id, filter],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('documents')
        .select('*, document_tags(tag_id, tags(id, name, color))')
        .eq('user_id', user.id);

      if (filter?.trashed !== undefined) {
        query = query.eq('trashed', filter.trashed);
      } else {
        query = query.eq('trashed', false);
      }

      if (filter?.starred) {
        query = query.eq('starred', true);
      }

      if (filter?.shared) {
        query = query.eq('shared', true);
      }

      if (filter?.recent) {
        query = query.order('updated_at', { ascending: false }).limit(20);
      } else {
        query = query.order('updated_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      const docs = (data || []).map((doc: any) => ({
        ...doc,
        tags: doc.document_tags?.map((dt: any) => dt.tags).filter(Boolean) || [],
      }));

      if (filter?.tagId) {
        return docs.filter((d: Document) => d.tags?.some((t) => t.id === filter.tagId));
      }

      return docs as Document[];
    },
    enabled: !!user,
  });
}

export function useDocumentMutations() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: ['documents'] });

  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');
      const ext = file.name.split('.').pop();
      const storagePath = `${user.id}/${uuidv4()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('documents').insert({
        user_id: user.id,
        name: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        storage_path: storagePath,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Document uploaded');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const renameDocument = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from('documents').update({ name }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Renamed'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleStar = useMutation({
    mutationFn: async ({ id, starred }: { id: string; starred: boolean }) => {
      const { error } = await supabase.from('documents').update({ starred }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
  });

  const trashDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('documents').update({
        trashed: true,
        trashed_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Moved to trash'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const restoreDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('documents').update({
        trashed: false,
        trashed_at: null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Restored'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const permanentDelete = useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      await supabase.storage.from('documents').remove([storagePath]);
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Permanently deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleShare = useMutation({
    mutationFn: async ({ id, shared }: { id: string; shared: boolean }) => {
      const update: any = { shared };
      if (shared) {
        update.share_token = uuidv4();
      } else {
        update.share_token = null;
      }
      const { error } = await supabase.from('documents').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const downloadDocument = async (storagePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from('documents').download(storagePath);
    if (error) { toast.error('Download failed'); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    uploadDocument,
    renameDocument,
    toggleStar,
    trashDocument,
    restoreDocument,
    permanentDelete,
    toggleShare,
    downloadDocument,
  };
}
