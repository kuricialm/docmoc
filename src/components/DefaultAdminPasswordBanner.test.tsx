import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import DefaultAdminPasswordBanner from './DefaultAdminPasswordBanner';

describe('DefaultAdminPasswordBanner', () => {
  it('renders the global warning and settings link when visible', () => {
    render(
      <MemoryRouter>
        <DefaultAdminPasswordBanner visible />
      </MemoryRouter>,
    );

    expect(screen.getByText('Default admin password still active')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('renders nothing once the default password has been replaced', () => {
    render(
      <MemoryRouter>
        <DefaultAdminPasswordBanner visible={false} />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Default admin password still active')).not.toBeInTheDocument();
  });
});
