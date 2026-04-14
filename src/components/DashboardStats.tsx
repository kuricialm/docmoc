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
  const availableStorage = user?.uploadQuotaBytes == null
    ? 'Unlimited'
    : formatFileSize(Math.max(0, user.uploadQuotaBytes - totalUploadedSize));

  const stats = [
    { label: 'Total Documents', value: total, icon: FileText, path: '/' },
    { label: 'Recent Uploads', value: recent, icon: Clock, path: '/recent' },
    { label: 'Shared by Me', value: shared, icon: Share2, path: '/shared' },
    { label: 'In Trash', value: trashed, icon: Trash2, path: '/trash' },
    { label: 'Available Storage', value: availableStorage, icon: HardDrive, path: '/settings' },
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
    </div>
  );
}
