import { FileText, Clock, Share2, Trash2, HardDrive } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Document } from '@/hooks/useDocuments';
import { formatFileSize } from '@/lib/fileTypes';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  documents: Document[];
};

export default function DashboardStats({ documents }: Props) {
  const { user } = useAuth();
  const total = documents.filter((d) => !d.trashed).length;
  const recent = documents.filter(
    (d) => !d.trashed && new Date(d.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const shared = documents.filter((d) => !d.trashed && d.shared).length;
  const trashed = documents.filter((d) => d.trashed).length;
  const totalUploadedSize = documents.reduce((sum, d) => sum + d.file_size, 0);
  const quotaBytes = user?.uploadQuotaBytes ?? null;
  const hasQuota = quotaBytes !== null;
  const usedPercent = hasQuota
    ? (quotaBytes <= 0 ? (totalUploadedSize > 0 ? 100 : 0) : Math.min(100, (totalUploadedSize / quotaBytes) * 100))
    : null;
  const totalQuotaLabel = hasQuota ? formatFileSize(quotaBytes) : '∞';

  const stats = [
    { label: 'Total Documents', value: total, icon: FileText, path: '/' },
    { label: 'Recent Uploads', value: recent, icon: Clock, path: '/recent' },
    { label: 'Shared by Me', value: shared, icon: Share2, path: '/shared' },
    { label: 'In Trash', value: trashed, icon: Trash2, path: '/trash' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <Link
          key={stat.label}
          to={stat.path}
          className="bg-muted/50 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-muted transition-colors duration-150"
        >
          <div className="p-2.5 rounded-xl bg-background">
            <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        </Link>
      ))}
      <Link
        to="/settings"
        className="bg-muted/50 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-muted transition-colors duration-150"
      >
        <div className="p-2.5 rounded-xl bg-background">
          <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1 min-w-0 leading-none whitespace-nowrap">
            <p className="text-xl sm:text-2xl font-semibold tracking-tight tabular-nums shrink-0">{formatFileSize(totalUploadedSize)}</p>
            <p className="text-sm sm:text-base font-medium text-muted-foreground/80 tabular-nums truncate">/ {totalQuotaLabel}</p>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Storage Used</p>
          <div className="mt-1.5 h-1.5 rounded-full bg-background/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground/65 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, usedPercent ?? 0))}%` }}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
