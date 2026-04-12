import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Tag = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export function useTags() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      if (error) throw error;
      return data as Tag[];
    },
    enabled: !!user,
  });
}

export function useTagMutations() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tags'] });
    qc.invalidateQueries({ queryKey: ['documents'] });
  };

  const createTag = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('tags').insert({ user_id: user.id, name, color });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Tag created'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateTag = useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name: string; color: string }) => {
      const { error } = await supabase.from('tags').update({ name, color }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Tag updated'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Tag deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addTagToDocument = useMutation({
    mutationFn: async ({ documentId, tagId }: { documentId: string; tagId: string }) => {
      const { error } = await supabase.from('document_tags').insert({ document_id: documentId, tag_id: tagId });
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  const removeTagFromDocument = useMutation({
    mutationFn: async ({ documentId, tagId }: { documentId: string; tagId: string }) => {
      const { error } = await supabase.from('document_tags').delete()
        .eq('document_id', documentId)
        .eq('tag_id', tagId);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  return { createTag, updateTag, deleteTag, addTagToDocument, removeTagFromDocument };
}
