import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Login from './Login';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    appSettings: {
      registration_enabled: true,
      workspace_favicon_url: null,
      workspace_logo_url: '/api/profile/logo/workspace.png?v=1',
    },
    signIn: vi.fn(),
  }),
}));

describe('Login', () => {
  it('renders the workspace logo directly from app settings', () => {
    render(<Login />);
    expect(screen.getByAltText('Workspace Logo')).toHaveAttribute('src', '/api/profile/logo/workspace.png?v=1');
  });
});
