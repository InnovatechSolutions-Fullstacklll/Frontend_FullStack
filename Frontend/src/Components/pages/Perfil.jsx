import { useEffect, useState } from 'react'
import Navbar from '../Organism/Navbar'
import Footer from '../Organism/Footer'
import Sidebar from '../Organism/Sidebar'
import '../Style/Perfil.css'

const defaultProfile = {
  nombre: 'Usuario Innovatech',
  email: 'usuario@innovatech.com',
  cargo: 'Administrador',
  area: 'Gestion de proyectos',
  telefono: '+56 9 0000 0000',
  bio: 'Perfil preparado para conectar los datos reales del login o registro.',
}

const getStoredProfile = () => {
  try {
    const storedProfile = localStorage.getItem('userProfile')
    const storedUser = localStorage.getItem('user')
    const parsedProfile = storedProfile ? JSON.parse(storedProfile) : null
    const parsedUser = storedUser ? JSON.parse(storedUser) : null

    return {
      ...defaultProfile,
      ...(parsedUser || {}),
      ...(parsedProfile || {}),
    }
  } catch {
    return defaultProfile
  }
}

function Perfil() {
  const [profile, setProfile] = useState(defaultProfile)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setProfile(getStoredProfile())
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    localStorage.setItem('userProfile', JSON.stringify(profile))
    setMessage('Perfil actualizado correctamente.')
  }

  const initials = profile.nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-layout">
        <Sidebar />

        <main className="profile-content">
          <section className="profile-header">
            <div>
              <p className="profile-eyebrow">Cuenta personal</p>
              <h1>Mi Perfil</h1>
              <p>
                Administra los datos principales de tu cuenta y mantenlos listos
                para mostrarlos en el panel.
              </p>
            </div>
          </section>

          <section className="profile-grid">
            <article className="profile-summary">
              <div className="profile-avatar" aria-hidden="true">
                {initials || 'UI'}
              </div>
              <h2>{profile.nombre}</h2>
              <p>{profile.email}</p>
              <div className="profile-tags">
                <span>{profile.cargo}</span>
                <span>{profile.area}</span>
              </div>
            </article>

            <article className="profile-panel">
              <div className="profile-panel-heading">
                <h2>Informacion del usuario</h2>
                <span>Datos visibles en tu cuenta</span>
              </div>

              <form className="profile-form" onSubmit={handleSubmit}>
                <label>
                  Nombre completo
                  <input
                    name="nombre"
                    type="text"
                    value={profile.nombre}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Correo electronico
                  <input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Cargo
                  <input
                    name="cargo"
                    type="text"
                    value={profile.cargo}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Area
                  <input
                    name="area"
                    type="text"
                    value={profile.area}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Telefono
                  <input
                    name="telefono"
                    type="tel"
                    value={profile.telefono}
                    onChange={handleChange}
                  />
                </label>

                <label className="profile-form-full">
                  Biografia breve
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows="4"
                  />
                </label>

                <div className="profile-actions">
                  <button type="submit">Guardar cambios</button>
                  {message && <p>{message}</p>}
                </div>
              </form>
            </article>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default Perfil
