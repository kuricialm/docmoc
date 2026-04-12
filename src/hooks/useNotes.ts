import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useDocumentNote(documentId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document-note', documentId, user?.id],
    queryFn: async () => {
      if (!user || !documentId) return null;
      const { data } = await supabase
        .from('document_notes')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!documentId,
  });
}

export function useNoteMutations() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const upsertNote = useMutation({
    mutationFn: async ({ documentId, content }: { documentId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data: existing } = await supabase
        .from('document_notes')
        .select('id')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from('document_notes').update({ content }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('document_notes').insert({
          document_id: documentId,
          user_id: user.id,
          content,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-note'] }),
  });

  return { upsertNote };
}
