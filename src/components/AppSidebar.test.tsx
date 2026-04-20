import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AppSidebar from './AppSidebar';

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    isOver: false,
    setNodeRef: vi.fn(),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    appSettings: {
      workspace_logo_url: null,
    },
    isAdmin: true,
  }),
}));

vi.mock('@/contexts/DocumentDragContext', () => ({
  useDocumentDragContext: () => ({
    activeDocument: null,
    activeTargetId: null,
    enabled: false,
  }),
}));

vi.mock('@/hooks/useTags', () => ({
  useTags: () => ({
    data: [],
  }),
}));

vi.mock('./TagManager', () => ({
  default: () => null,
}));

describe('AppSidebar', () => {
  it('renders a roomier square icon rail when collapsed on desktop', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppSidebar collapsed onToggle={vi.fn()} />
      </MemoryRouter>,
    );

    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('w-[4.5rem]');

    const allDocumentsLink = screen.getByTitle('All Documents');
    expect(allDocumentsLink).toHaveClass('h-10', 'w-10', 'mx-auto');
  });

  it('uses a slide-over drawer width on mobile', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppSidebar collapsed={false} isMobile mobileOpen onToggle={vi.fn()} onMobileClose={vi.fn()} />
      </MemoryRouter>,
    );

    const overlay = container.querySelector('div.fixed.inset-0.z-30');
    const aside = container.querySelector('aside');

    expect(overlay).toBeInTheDocument();
    expect(aside).toHaveClass('w-[calc(100vw-1rem)]', 'max-w-72');
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
