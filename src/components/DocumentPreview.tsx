import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isImageType } from '@/lib/fileTypes';
import { hasArabicCharacters } from '@/lib/text';
import { cn } from '@/lib/utils';
import FileTypeIcon from './FileTypeIcon';

type Props = {
  fileType: string;
  fileName: string;
  previewUrl?: string | null;
  textContent?: string | null;
  textIsArabic?: boolean;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  iframeClassName?: string;
  onDownload?: () => void;
};

export default function DocumentPreview({
  fileType,
  fileName,
  previewUrl,
  textContent,
  textIsArabic = false,
  className,
  imageClassName,
  textClassName,
  iframeClassName,
  onDownload,
}: Props) {
  if (fileType === 'application/pdf' && previewUrl) {
    return (
      <div className={cn('h-full w-full', className)}>
        <iframe
          src={previewUrl}
          title={fileName}
          className={cn('h-full w-full rounded-lg border border-border/30 bg-white', iframeClassName)}
        />
      </div>
    );
  }

  if (fileType === 'text/plain' && textContent !== null) {
    return (
      <pre
        className={cn(
          'h-full w-full overflow-auto whitespace-pre-wrap rounded-lg border border-border/30 bg-card p-4 text-sm',
          (textIsArabic || hasArabicCharacters(textContent)) && 'font-arabic-text',
          textClassName,
          className,
        )}
      >
        {textContent}
      </pre>
    );
  }

  if (isImageType(fileType) && previewUrl) {
    return (
      <div className={cn('flex h-full w-full items-center justify-center', className)}>
        <img
          src={previewUrl}
          alt={fileName}
          className={cn('max-h-full max-w-full rounded-lg object-contain', imageClassName)}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center space-y-4', className)}>
      <FileTypeIcon fileType={fileType} size="lg" />
      <p className="text-sm text-muted-foreground">Preview not available for this format</p>
      {onDownload && (
        <Button variant="outline" size="sm" className="rounded-lg" onClick={onDownload}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download to view
        </Button>
      )}
    </div>
  );
}
