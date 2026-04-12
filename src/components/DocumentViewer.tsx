import { useState, useEffect } from 'react';
import { Document } from '@/hooks/useDocuments';
import { useDocumentNote, useNoteMutations } from '@/hooks/useNotes';
import { supabase } from '@/integrations/supabase/client';
import { getFileTypeInfo, formatFileSize, isPreviewable, isImageType } from '@/lib/fileTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X, Download, Share2, ExternalLink, Copy } from 'lucide-react';
import FileTypeIcon from './FileTypeIcon';
import { useDocumentMutations } from '@/hooks/useDocuments';
import { toast } from 'sonner';

type Props = {
  document: Document | null;
  open: boolean;
  onClose: () => void;
};

export default function DocumentViewer({ document: doc, open, onClose }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const { data: note } = useDocumentNote(doc?.id);
  const { upsertNote } = useNoteMutations();
  const { downloadDocument, toggleShare } = useDocumentMutations();

  useEffect(() => {
    if (note) setNoteText(note.content);
    else setNoteText('');
  }, [note]);

  useEffect(() => {
    if (!doc || !open) { setPreviewUrl(null); setTextContent(null); return; }

    const loadPreview = async () => {
      if (doc.file_type === 'text/plain') {
        const { data } = await supabase.storage.from('documents').download(doc.storage_path);
        if (data) setTextContent(await data.text());
      } else if (doc.file_type === 'application/pdf' || isImageType(doc.file_type)) {
        const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 3600);
        if (data) setPreviewUrl(data.signedUrl);
      }
    };
    loadPreview();
  }, [doc, open]);

  if (!doc) return null;
  const typeInfo = getFileTypeInfo(doc.file_type);
  const canPreview = isPreviewable(doc.file_type);
  const shareUrl = doc.shared && doc.share_token ? `${window.location.origin}/shared/${doc.share_token}` : null;

  const handleSaveNote = () => {
    upsertNote.mutate({ documentId: doc.id, content: noteText });
    toast.success('Note saved');
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold truncate pr-4">{doc.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-secondary/20 flex items-center justify-center overflow-auto p-4">
            {doc.file_type === 'application/pdf' && previewUrl ? (
              <iframe src={previewUrl} className="w-full h-full rounded border" title="PDF Preview" />
            ) : doc.file_type === 'text/plain' && textContent !== null ? (
              <pre className="w-full h-full overflow-auto p-4 text-sm font-mono bg-card rounded border whitespace-pre-wrap">{textContent}</pre>
            ) : isImageType(doc.file_type) && previewUrl ? (
              <img src={previewUrl} alt={doc.name} className="max-w-full max-h-full object-contain rounded" />
            ) : (
              <div className="text-center space-y-3">
                <FileTypeIcon fileType={doc.file_type} size="lg" />
                <p className="text-sm text-muted-foreground">Preview not available for this format</p>
                <Button variant="outline" size="sm" onClick={() => downloadDocument(doc.storage_path, doc.name)}>
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Download to view
                </Button>
              </div>
            )}
          </div>

          <div className="w-80 border-l flex flex-col overflow-y-auto">
            <div className="p-4 space-y-4 border-b">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium px-1.5 py-0.5 rounded text-xs" style={{ color: typeInfo.color, backgroundColor: typeInfo.bgColor }}>{typeInfo.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modified</span>
                  <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {doc.tags.map((tag) => (
                    <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 space-y-3 border-b">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</h3>
              <div className="flex flex-col gap-1.5">
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => downloadDocument(doc.storage_path, doc.name)}>
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={() => toggleShare.mutate({ id: doc.id, shared: !doc.shared })}
                >
                  <Share2 className="w-3.5 h-3.5" /> {doc.shared ? 'Disable Sharing' : 'Share Link'}
                </Button>
                {shareUrl && (
                  <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs text-muted-foreground" onClick={handleCopyLink}>
                    <Copy className="w-3.5 h-3.5" /> Copy link
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Private Notes</h3>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add private notes about this document..."
                className="flex-1 min-h-[100px] resize-none text-sm"
              />
              <Button size="sm" className="mt-2 self-end" onClick={handleSaveNote}>
                Save Note
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
