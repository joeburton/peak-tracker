import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFindAll, mockGetDb, mockCreatePeakListRepository } = vi.hoisted(() => ({
  mockFindAll: vi.fn(),
  mockGetDb: vi.fn().mockResolvedValue({}),
  mockCreatePeakListRepository: vi.fn(),
}));

vi.mock('@/lib/db/mongodb', () => ({ getDb: mockGetDb }));
vi.mock('@/lib/db/repositories/peak-list-repository', () => ({
  createPeakListRepository: mockCreatePeakListRepository,
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
    mockCreatePeakListRepository.mockReturnValue({ findAll: mockFindAll });
    mockFindAll.mockResolvedValue(mockPeakLists);
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

  it('renders an empty list when no peak lists exist', async () => {
    mockFindAll.mockResolvedValue([]);
    render(await Home());
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
