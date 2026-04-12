import { FileText, FileSpreadsheet, FileImage, Presentation, File } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, { icon: typeof FileText; color: string }> = {
  'application/pdf': { icon: FileText, color: '#EF4444' },
  'text/plain': { icon: FileText, color: '#6B7280' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: '#3B82F6' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, color: '#22C55E' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: Presentation, color: '#F97316' },
};

export default function FileTypeIcon({ fileType, size = 'md' }: { fileType: string; size?: 'sm' | 'md' | 'lg' }) {
  const isImage = fileType.startsWith('image/');
  const config = iconMap[fileType];
  const Icon = config?.icon || (isImage ? FileImage : File);
  const color = config?.color || (isImage ? '#8B5CF6' : '#6B7280');

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return <Icon className={cn(sizeClasses[size])} style={{ color }} />;
}
