import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockRegionalBreakdown } = vi.hoisted(() => ({
  mockRegionalBreakdown: vi.fn(),
}));

vi.mock('./regional-breakdown', () => ({
  RegionalBreakdown: mockRegionalBreakdown,
}));

import { RegionalBreakdownDialog } from './regional-breakdown-dialog';

const mockRegions = [
  { region: 'Eastern Fells', total: 35, completed: 7, remaining: 28, percentageComplete: 20 },
  { region: 'Northern Fells', total: 18, completed: 18, remaining: 0, percentageComplete: 100 },
];

beforeEach(() => {
  mockRegionalBreakdown.mockReset();
  mockRegionalBreakdown.mockReturnValue(<div data-testid="regional-breakdown" />);
});

describe('RegionalBreakdownDialog', () => {
  it('renders the trigger button', () => {
    render(<RegionalBreakdownDialog regions={mockRegions} />);
    expect(screen.getByRole('button', { name: /regional breakdown/i })).toBeInTheDocument();
  });

  it('dialog content is not visible before trigger is clicked', () => {
    render(<RegionalBreakdownDialog regions={mockRegions} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the dialog when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<RegionalBreakdownDialog regions={mockRegions} />);
    await user.click(screen.getByRole('button', { name: /regional breakdown/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('dialog contains the RegionalBreakdown component', async () => {
    const user = userEvent.setup();
    render(<RegionalBreakdownDialog regions={mockRegions} />);
    await user.click(screen.getByRole('button', { name: /regional breakdown/i }));
    expect(screen.getByTestId('regional-breakdown')).toBeInTheDocument();
  });

  it('passes regions to RegionalBreakdown', async () => {
    const user = userEvent.setup();
    render(<RegionalBreakdownDialog regions={mockRegions} />);
    await user.click(screen.getByRole('button', { name: /regional breakdown/i }));
    const [calledProps] = mockRegionalBreakdown.mock.calls[0] as [Record<string, unknown>];
    expect(calledProps).toMatchObject({ regions: mockRegions });
  });

  it('dialog has the correct title', async () => {
    const user = userEvent.setup();
    render(<RegionalBreakdownDialog regions={mockRegions} />);
    await user.click(screen.getByRole('button', { name: /regional breakdown/i }));
    expect(screen.getByRole('heading', { name: /regional breakdown/i })).toBeInTheDocument();
  });

  it('closes the dialog when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<RegionalBreakdownDialog regions={mockRegions} />);
    await user.click(screen.getByRole('button', { name: /regional breakdown/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('returns null when regions array is empty', () => {
    const { container } = render(<RegionalBreakdownDialog regions={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
