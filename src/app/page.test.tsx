import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetPeakLists } = vi.hoisted(() => ({
  mockGetPeakLists: vi.fn(),
}));

vi.mock('@/features/peaks/services/peak-list.service', () => ({
  getPeakLists: mockGetPeakLists,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import Home from './page';

const mockPeakLists = [
  { id: '1', slug: 'wainwrights', name: 'Wainwrights', peakCount: 214 },
  { id: '2', slug: 'munros', name: 'Munros', peakCount: 282 },
];

describe('Home page', () => {
  beforeEach(() => {
    mockGetPeakLists.mockReset();
    mockGetPeakLists.mockResolvedValue(mockPeakLists);
  });

  it('renders the Peak Lists heading', async () => {
    render(await Home());
    expect(screen.getByRole('heading', { name: /peak lists/i })).toBeInTheDocument();
  });

  it('renders the correct number of peak list items', async () => {
    render(await Home());
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders each peak list name', async () => {
    render(await Home());
    expect(screen.getByText('Wainwrights')).toBeInTheDocument();
    expect(screen.getByText('Munros')).toBeInTheDocument();
  });

  it('renders the peak count for each list', async () => {
    render(await Home());
    expect(screen.getByText('214 peaks')).toBeInTheDocument();
    expect(screen.getByText('282 peaks')).toBeInTheDocument();
  });

  it('links each list to its slug page', async () => {
    render(await Home());
    expect(screen.getByRole('link', { name: /wainwrights/i })).toHaveAttribute(
      'href',
      '/peak-lists/wainwrights',
    );
    expect(screen.getByRole('link', { name: /munros/i })).toHaveAttribute(
      'href',
      '/peak-lists/munros',
    );
  });

  it('renders an empty-state message when no peak lists exist', async () => {
    mockGetPeakLists.mockResolvedValue([]);
    render(await Home());
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByText(/no peak lists available/i)).toBeInTheDocument();
  });
});
