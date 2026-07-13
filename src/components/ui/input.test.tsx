import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Input } from './input';

describe('Input', () => {
  it('renders a text input by default', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });

  it('applies the given type', () => {
    render(<Input type="email" aria-label="Email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('type', 'email');
  });

  it('merges a custom className with the base styles', () => {
    render(<Input aria-label="Search" className="custom-class" />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveClass('custom-class');
  });

  it('forwards the ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Name" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Search" />);
    const input = screen.getByRole('textbox', { name: 'Search' });
    await user.type(input, 'Scafell Pike');
    expect(input).toHaveValue('Scafell Pike');
  });

  it('respects the disabled attribute', () => {
    render(<Input aria-label="Search" disabled />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeDisabled();
  });

  it('calls onChange when the value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Search" onChange={onChange} />);
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'a');
    expect(onChange).toHaveBeenCalled();
  });
});
