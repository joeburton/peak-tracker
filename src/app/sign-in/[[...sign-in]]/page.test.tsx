import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignInPage, { metadata } from './page'

vi.mock('@clerk/nextjs', () => ({
  SignIn: () => <div data-testid="clerk-sign-in" />,
}))

describe('SignInPage', () => {
  it('renders the Clerk SignIn component inside a main element', () => {
    render(<SignInPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument()
  })

  it('exports page metadata with a descriptive title', () => {
    expect(metadata.title).toBe('Sign In — Peak Tracker UK')
  })
})
