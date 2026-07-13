import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

function renderSelect(onValueChange = vi.fn()) {
  render(
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Sort order">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
        <SelectItem value="height-desc">Height (highest first)</SelectItem>
      </SelectContent>
    </Select>
  );
  return onValueChange;
}

describe('Select', () => {
  it('renders a combobox with the placeholder when no value is selected', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Sort order' });
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('opens the listbox and shows options when clicked', async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.click(screen.getByRole('combobox', { name: 'Sort order' }));
    expect(await screen.findByRole('option', { name: 'Name (A-Z)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Height (highest first)' })).toBeInTheDocument();
  });

  it('calls onValueChange with the selected value', async () => {
    const user = userEvent.setup();
    const onValueChange = renderSelect();
    await user.click(screen.getByRole('combobox', { name: 'Sort order' }));
    await user.click(await screen.findByRole('option', { name: 'Height (highest first)' }));
    expect(onValueChange).toHaveBeenCalledWith('height-desc');
  });

  it('reflects the controlled value in the trigger', () => {
    render(
      <Select value="name-asc" onValueChange={vi.fn()}>
        <SelectTrigger aria-label="Sort order">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="height-desc">Height (highest first)</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByRole('combobox', { name: 'Sort order' })).toHaveTextContent('Name (A-Z)');
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Select disabled onValueChange={vi.fn()}>
        <SelectTrigger aria-label="Sort order">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = screen.getByRole('combobox', { name: 'Sort order' });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });
});
