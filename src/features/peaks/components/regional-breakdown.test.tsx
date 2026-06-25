import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RegionalBreakdown } from './regional-breakdown';

const mockRegions = [
  { region: 'Eastern Fells', total: 35, completed: 7, remaining: 28, percentageComplete: 20 },
  { region: 'Northern Fells', total: 18, completed: 18, remaining: 0, percentageComplete: 100 },
  { region: 'Southern Fells', total: 42, completed: 0, remaining: 42, percentageComplete: 0 },
];

describe('RegionalBreakdown', () => {
  it('renders a row for each region', () => {
    render(<RegionalBreakdown regions={mockRegions} />);
    expect(screen.getByText('Eastern Fells')).toBeInTheDocument();
    expect(screen.getByText('Northern Fells')).toBeInTheDocument();
    expect(screen.getByText('Southern Fells')).toBeInTheDocument();
  });

  it('renders completed/total and percentage for each region', () => {
    render(<RegionalBreakdown regions={mockRegions} />);
    expect(screen.getByText(/7.*35.*20%/)).toBeInTheDocument();
    expect(screen.getByText(/18.*18.*100%/)).toBeInTheDocument();
    expect(screen.getByText(/0.*42.*0%/)).toBeInTheDocument();
  });

  it('renders a progressbar for each region with correct aria attributes', () => {
    render(<RegionalBreakdown regions={mockRegions} />);
    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(3);
    const eastern = bars[0];
    expect(eastern).toHaveAttribute('aria-valuenow', '20');
    expect(eastern).toHaveAttribute('aria-valuemin', '0');
    expect(eastern).toHaveAttribute('aria-valuemax', '100');
    expect(eastern).toHaveAttribute('aria-label', 'Eastern Fells: 20% complete');
  });

  it('renders a section with accessible label', () => {
    render(<RegionalBreakdown regions={mockRegions} />);
    expect(screen.getByRole('region', { name: 'Regional breakdown' })).toBeInTheDocument();
  });

  it('returns null when regions array is empty', () => {
    const { container } = render(<RegionalBreakdown regions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders 0% correctly for regions with no completions', () => {
    render(<RegionalBreakdown regions={mockRegions} />);
    const bars = screen.getAllByRole('progressbar');
    const southern = bars[2]; // Southern Fells — 0%
    expect(southern).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders 100% correctly for fully completed regions', () => {
    render(<RegionalBreakdown regions={mockRegions} />);
    const bars = screen.getAllByRole('progressbar');
    const northern = bars[1]; // Northern Fells — 100%
    expect(northern).toHaveAttribute('aria-valuenow', '100');
  });
});
