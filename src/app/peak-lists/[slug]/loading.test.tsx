import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Loading from './loading';

describe('Loading', () => {
  it('renders skeleton placeholders for stats, filters, and list rows', () => {
    const { container: root } = render(<Loading />);
    expect(root.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});
