import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignUpPage, { metadata } from './page'

vi.mock('@clerk/nextjs', () => ({
  SignUp: () => <div data-testid="clerk-sign-up" />,
}))

describe('SignUpPage', () => {
  it('renders the Clerk SignUp component', () => {
    render(<SignUpPage />)
    expect(screen.getByTestId('clerk-sign-up')).toBeInTheDocument()
  })

  it('exports page metadata with a descriptive title', () => {
    expect(metadata.title).toBe('Sign Up — Peak Tracker UK')
  })
})
