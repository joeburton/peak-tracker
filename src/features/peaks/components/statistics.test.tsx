import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Statistics } from './statistics';

const mockStatistics = {
  total: 214,
  completed: 50,
  remaining: 164,
  percentageComplete: 23.4,
  byRegion: [],
};

describe('Statistics', () => {
  it('renders total, completed, remaining, and progress values', () => {
    render(<Statistics statistics={mockStatistics} />);
    expect(screen.getByText('214')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('164')).toBeInTheDocument();
    expect(screen.getByText('23.4%')).toBeInTheDocument();
  });

  it('renders term labels for each statistic', () => {
    render(<Statistics statistics={mockStatistics} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('renders a section with the default aria-label', () => {
    render(<Statistics statistics={mockStatistics} />);
    expect(screen.getByRole('region', { name: 'Progress statistics' })).toBeInTheDocument();
  });

  it('accepts a custom aria label', () => {
    render(<Statistics statistics={mockStatistics} label="Wainwrights progress statistics" />);
    expect(
      screen.getByRole('region', { name: 'Wainwrights progress statistics' }),
    ).toBeInTheDocument();
  });

  it('uses a definition list for semantic term/value pairing', () => {
    render(<Statistics statistics={mockStatistics} />);
    expect(screen.getAllByRole('term')).toHaveLength(4);
    expect(screen.getAllByRole('definition')).toHaveLength(4);
  });

  it('renders 0% correctly when no peaks are completed', () => {
    const stats = { ...mockStatistics, completed: 0, remaining: 214, percentageComplete: 0 };
    render(<Statistics statistics={stats} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders 100% correctly when all peaks are completed', () => {
    const stats = { ...mockStatistics, completed: 214, remaining: 0, percentageComplete: 100 };
    render(<Statistics statistics={stats} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
