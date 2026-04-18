import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TrashPage from './Trash';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    appSettings: {
      registration_enabled: true,
      trash_retention_days: 10,
      workspace_favicon_url: null,
      workspace_logo_url: null,
    },
  }),
}));

vi.mock('@/hooks/useDocuments', () => ({
  useDocuments: () => ({
    data: [{
      id: 'doc-1',
      user_id: 'user-1',
      name: 'Quarterly Report.pdf',
      file_type: 'application/pdf',
      file_size: 1024,
      storage_path: '/tmp/quarterly-report.pdf',
      starred: false,
      trashed: true,
      trashed_at: '2026-04-15T12:00:00.000Z',
      shared: false,
      share_token: null,
      created_at: '2026-04-10T12:00:00.000Z',
      updated_at: '2026-04-15T12:00:00.000Z',
    }],
  }),
  useDocumentMutations: () => ({
    restoreDocument: { mutate: vi.fn() },
    permanentDelete: { mutate: vi.fn() },
  }),
}));

describe('TrashPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-18T12:00:00.000Z'));
  });

  it('shows the admin-configured retention period in the header and countdown', () => {
    render(<TrashPage search="" />);

    expect(screen.getByText('Documents are permanently deleted after 10 days')).toBeInTheDocument();
    expect(screen.getByText(/7 days left/)).toBeInTheDocument();

    vi.useRealTimers();
  });
});
