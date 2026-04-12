import { FileText, Clock, Share2, Trash2 } from 'lucide-react';
import { Document } from '@/hooks/useDocuments';

type Props = {
  documents: Document[];
};

export default function DashboardStats({ documents }: Props) {
  const total = documents.filter((d) => !d.trashed).length;
  const recent = documents.filter(
    (d) => !d.trashed && new Date(d.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const shared = documents.filter((d) => !d.trashed && d.shared).length;
  const trashed = documents.filter((d) => d.trashed).length;

  const stats = [
    { label: 'Total Documents', value: total, icon: FileText, color: 'text-primary' },
    { label: 'Recent Uploads', value: recent, icon: Clock, color: 'text-amber-500' },
    { label: 'Shared by Me', value: shared, icon: Share2, color: 'text-emerald-500' },
    { label: 'In Trash', value: trashed, icon: Trash2, color: 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card border rounded-lg p-4 flex items-center gap-3">
          <div className={`p-2 rounded-md bg-secondary ${stat.color}`}>
            <stat.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
