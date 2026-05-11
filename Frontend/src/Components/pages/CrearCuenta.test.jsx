import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CrearCuenta from './CrearCuenta'

describe('CrearCuenta', () => {
  it('muestra error si el nombre es muy corto', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Al')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'usuario@ejemplo.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), '1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), '1234')
    await user.click(screen.getByLabelText(/Acepto los términos/i))
    const submitButton = within(screen.getByRole('main')).getByRole('button', { name: /Crear Cuenta/i })
    await user.click(submitButton)

    expect(await screen.findByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument()
  })

  it('renderiza el formulario de crear cuenta', () => {
    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('Ingresa tu nombre completo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Crea una contraseña segura')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Repite tu contraseña')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Crear cuenta/i }).length).toBeGreaterThan(0)
  })

  it('muestra error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Alejandro')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'usuario@ejemplo.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), '1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), '4321')
    await user.click(screen.getByLabelText(/Acepto los términos/i))
    const submitButton = within(screen.getByRole('main')).getByRole('button', { name: /Crear Cuenta/i })
    await user.click(submitButton)
    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })
})
