import React from 'react'
import Navbar from '../Organism/Navbar'
import Sidebar from '../Organism/Sidebar'
import Footer from '../Organism/Footer'
import '../Style/MiPerfil.css'

function MiPerfil() {
  const profileData = [
    { label: 'Nombre', value: 'Ana Gómez' },
    { label: 'Correo', value: 'ana.gomez@ejemplo.com' },
    { label: 'Rol', value: 'Administrador' },
    { label: 'Plan', value: 'Pro' },
  ]

  const activityItems = [
    'Actualizó la información del perfil la semana pasada.',
    'Revisó configuraciones de seguridad y notificaciones.',
    'Ajustó preferencias de visualización del panel.',
  ]

  return (
    <div className="profile-page">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content profile-content">
          <section className="profile-hero-card">
            <div className="profile-avatar">AG</div>
            <div>
              <p className="eyebrow">Mi Perfil</p>
              <h2>Hola, Ana</h2>
              <p className="hero-text">
                Aquí puedes ver el resumen de tu cuenta, tus datos principales y el estado de tus preferencias.
              </p>
            </div>
          </section>

          <section className="profile-grid">
            <article className="profile-card">
              <div className="card-header-row">
                <h3>Datos principales</h3>
                <span className="badge">Activo</span>
              </div>

              <ul className="profile-list">
                {profileData.map((item) => (
                  <li key={item.label} className="profile-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            </article>

            <article className="profile-card">
              <h3>Actividad reciente</h3>
              <ul className="activity-list">
                {activityItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="profile-card settings-card">
            <h3>Preferencias</h3>
            <p>
              Puedes personalizar el tema, las alertas y la apariencia del panel desde la sección de configuración.
            </p>
            <button type="button" className="button-primary">Editar preferencias</button>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default MiPerfil
