import React from 'react'
import { render, screen } from '@testing-library/react'
import Footer from './Footer'

describe('Footer', () => {
  it('debe renderizar el texto del footer correctamente', () => {
    render(<Footer />)
    expect(screen.getByText(/© 2026 Mi App. Todos los derechos reservados./i)).toBeInTheDocument()
  })
})
