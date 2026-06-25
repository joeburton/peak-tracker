import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockRegionalBreakdown } = vi.hoisted(() => ({
  mockRegionalBreakdown: vi.fn(),
}));

vi.mock('./regional-breakdown', () => ({
  RegionalBreakdown: mockRegionalBreakdown,
}));

import { RegionalBreakdownAccordion } from './regional-breakdown-accordion';

const mockRegions = [
  { region: 'Eastern Fells', total: 35, completed: 7, remaining: 28, percentageComplete: 20 },
  { region: 'Northern Fells', total: 18, completed: 18, remaining: 0, percentageComplete: 100 },
];

beforeEach(() => {
  mockRegionalBreakdown.mockReset();
  mockRegionalBreakdown.mockReturnValue(<div data-testid="regional-breakdown" />);
});

describe('RegionalBreakdownAccordion', () => {
  it('renders the accordion trigger with the correct label', () => {
    render(<RegionalBreakdownAccordion regions={mockRegions} />);
    expect(screen.getByRole('button', { name: /regional breakdown/i })).toBeInTheDocument();
  });

  it('is closed by default — content is not in the document', () => {
    render(<RegionalBreakdownAccordion regions={mockRegions} />);
    // Radix AccordionContent unmounts its children when closed (no forceMount)
    expect(screen.queryByTestId('regional-breakdown')).not.toBeInTheDocument();
  });

  it('expands to show RegionalBreakdown when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<RegionalBreakdownAccordion regions={mockRegions} />);
    const trigger = screen.getByRole('button', { name: /regional breakdown/i });
    await user.click(trigger);
    expect(screen.getByTestId('regional-breakdown')).toBeVisible();
  });

  it('collapses back when the trigger is clicked a second time', async () => {
    const user = userEvent.setup();
    render(<RegionalBreakdownAccordion regions={mockRegions} />);
    const trigger = screen.getByRole('button', { name: /regional breakdown/i });
    await user.click(trigger);
    await user.click(trigger);
    expect(screen.queryByTestId('regional-breakdown')).not.toBeInTheDocument();
  });

  it('passes regions to RegionalBreakdown', async () => {
    const user = userEvent.setup();
    render(<RegionalBreakdownAccordion regions={mockRegions} />);
    await user.click(screen.getByRole('button', { name: /regional breakdown/i }));
    const [calledProps] = mockRegionalBreakdown.mock.calls[0] as [Record<string, unknown>];
    expect(calledProps).toMatchObject({ regions: mockRegions });
  });

  it('returns null when regions array is empty', () => {
    const { container } = render(<RegionalBreakdownAccordion regions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('trigger has correct aria-expanded attribute when closed', () => {
    render(<RegionalBreakdownAccordion regions={mockRegions} />);
    const trigger = screen.getByRole('button', { name: /regional breakdown/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('trigger has correct aria-expanded attribute when open', async () => {
    const user = userEvent.setup();
    render(<RegionalBreakdownAccordion regions={mockRegions} />);
    const trigger = screen.getByRole('button', { name: /regional breakdown/i });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
