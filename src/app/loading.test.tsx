import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from './loading';

describe('Loading', () => {
  it('renders skeleton placeholder items', () => {
    render(<Loading />);
    expect(screen.getByRole('list').children).toHaveLength(6);
  });
});
