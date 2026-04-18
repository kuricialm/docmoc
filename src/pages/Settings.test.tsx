import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPage from './Settings';

const {
  getOpenRouterSettings,
  getSettings,
  refreshSettings,
  updateSettings,
} = vi.hoisted(() => ({
  getOpenRouterSettings: vi.fn(),
  getSettings: vi.fn(),
  refreshSettings: vi.fn(),
  updateSettings: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    message: vi.fn(),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'admin@docmoc.local', uploadQuotaBytes: null },
    profile: { full_name: 'Admin User', accent_color: '#000000' },
    refreshProfile: vi.fn(),
    isAdmin: true,
    signOut: vi.fn(),
    appSettings: {
      registration_enabled: true,
      trash_retention_days: 14,
      workspace_favicon_url: null,
      workspace_logo_url: null,
    },
    refreshSettings,
  }),
}));

vi.mock('@/hooks/useLocalSettings', () => ({
  useLocalSettings: () => ({
    settings: { thumbnailPreviews: false },
    update: vi.fn(),
  }),
}));

vi.mock('@/lib/api', () => ({
  DEFAULT_APP_SETTINGS: {
    registration_enabled: true,
    trash_retention_days: 30,
    workspace_favicon_url: null,
    workspace_logo_url: null,
  },
  getSettings,
  updateSettings,
  getOpenRouterSettings,
  updatePassword: vi.fn(),
  updateProfile: vi.fn(),
  uploadLogo: vi.fn(),
  removeLogo: vi.fn(),
  uploadFavicon: vi.fn(),
  removeFavicon: vi.fn(),
  saveOpenRouterKey: vi.fn(),
  refreshOpenRouterModels: vi.fn(),
  removeOpenRouterKey: vi.fn(),
  saveOpenRouterPreferences: vi.fn(),
  queueMissingOpenRouterSummaries: vi.fn(),
  regenerateAllOpenRouterSummaries: vi.fn(),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    updateSettings.mockReset();
    refreshSettings.mockReset();
    getSettings.mockReset();
    getOpenRouterSettings.mockReset();

    getSettings.mockResolvedValue({
      registration_enabled: true,
      trash_retention_days: 14,
      workspace_favicon_url: null,
      workspace_logo_url: null,
    });
    getOpenRouterSettings.mockResolvedValue({
      provider: 'openrouter',
      configured: false,
      credential: null,
      preferences: {
        text_model_id: null,
        vision_model_id: null,
        summary_prompt: '',
        summary_prompt_default: '',
        text_model_valid: true,
        vision_model_valid: true,
      },
      models: {
        text: [],
        vision: [],
        fetched_at: null,
      },
      summary_backfill: {
        missing_count: 0,
        regeneratable_count: 0,
        queue_size: 0,
        auto_generate_on_upload: false,
        batches: {
          missing: null,
          regenerate: null,
        },
      },
    });
    updateSettings.mockResolvedValue(undefined);
    refreshSettings.mockResolvedValue(undefined);
  });

  it('loads and saves the admin trash retention setting', async () => {
    render(<SettingsPage />);

    const input = await screen.findByLabelText('Trash retention (days)');
    expect(input).toHaveValue(14);

    fireEvent.change(input, { target: { value: '21' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Retention' }));

    await waitFor(() => {
      expect(updateSettings).toHaveBeenCalledWith({ trash_retention_days: 21 });
    });
    expect(refreshSettings).toHaveBeenCalled();
  });

  it('shows only one masked OpenRouter key value when configured', async () => {
    getOpenRouterSettings.mockResolvedValueOnce({
      provider: 'openrouter',
      configured: true,
      credential: {
        expires_at: null,
        key_label: 'sk-or-v1-e75...048',
        last4: 'b048',
        last_error: null,
        last_model_sync_at: null,
        masked_key: '••••b048',
        status: 'valid',
        validated_at: '2026-04-18T10:00:00.000Z',
      },
      preferences: {
        text_model_id: null,
        vision_model_id: null,
        summary_prompt: '',
        summary_prompt_default: '',
        text_model_valid: true,
        vision_model_valid: true,
      },
      models: {
        text: [],
        vision: [],
        fetched_at: null,
      },
      summary_backfill: {
        missing_count: 0,
        regeneratable_count: 0,
        queue_size: 0,
        auto_generate_on_upload: false,
        batches: {
          missing: null,
          regenerate: null,
        },
      },
    });

    render(<SettingsPage />);

    expect(await screen.findByText('sk-or-v1-e75...048')).toBeInTheDocument();
    expect(screen.queryByText(/Mask:/i)).not.toBeInTheDocument();
    expect(screen.queryByText('••••b048')).not.toBeInTheDocument();
  });
});
