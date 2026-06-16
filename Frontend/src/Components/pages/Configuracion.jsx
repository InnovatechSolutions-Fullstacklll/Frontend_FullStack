import { useEffect, useState } from 'react'
import Navbar from '../Organism/Navbar'
import Footer from '../Organism/Footer'
import Sidebar from '../Organism/Sidebar'
import '../Style/Configuracion.css'

const defaultSettings = {
  emailNotifications: true,
  weeklySummary: true,
  privateProfile: false,
  compactMode: false,
  language: 'es',
}

const getStoredSettings = () => {
  try {
    const settings = localStorage.getItem('appSettings')
    return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

function Configuracion() {
  const [settings, setSettings] = useState(defaultSettings)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setSettings(getStoredSettings())
  }, [])

  const handleToggle = (event) => {
    const { name, checked } = event.target
    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: checked,
    }))
  }

  const handleLanguage = (event) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      language: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    localStorage.setItem('appSettings', JSON.stringify(settings))
    setMessage('Configuracion guardada correctamente.')
  }

  return (
    <div className="settings-page">
      <Navbar />

      <div className="settings-layout">
        <Sidebar />

        <main className="settings-content">
          <section className="settings-header">
            <div>
              <p className="settings-eyebrow">Preferencias</p>
              <h1>Configuracion</h1>
              <p>
                Ajusta opciones simples de notificaciones, privacidad y vista
                para personalizar tu experiencia.
              </p>
            </div>
          </section>

          <form className="settings-grid" onSubmit={handleSubmit}>
            <article className="settings-panel">
              <div className="settings-panel-heading">
                <h2>Notificaciones</h2>
                <span>Controla los avisos principales</span>
              </div>

              <label className="setting-row">
                <span>
                  Recibir notificaciones
                  <small>Alertas importantes sobre tu cuenta.</small>
                </span>
                <input
                  name="emailNotifications"
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={handleToggle}
                />
              </label>

              <label className="setting-row">
                <span>
                  Resumen semanal
                  <small>Un correo con avances y pendientes.</small>
                </span>
                <input
                  name="weeklySummary"
                  type="checkbox"
                  checked={settings.weeklySummary}
                  onChange={handleToggle}
                />
              </label>
            </article>

            <article className="settings-panel">
              <div className="settings-panel-heading">
                <h2>Cuenta</h2>
                <span>Preferencias basicas</span>
              </div>

              <label className="setting-row">
                <span>
                  Perfil privado
                  <small>Oculta tus datos del panel general.</small>
                </span>
                <input
                  name="privateProfile"
                  type="checkbox"
                  checked={settings.privateProfile}
                  onChange={handleToggle}
                />
              </label>

              <label className="setting-row">
                <span>
                  Vista compacta
                  <small>Reduce espacios en paneles y listas.</small>
                </span>
                <input
                  name="compactMode"
                  type="checkbox"
                  checked={settings.compactMode}
                  onChange={handleToggle}
                />
              </label>

              <label className="settings-select">
                Idioma
                <select value={settings.language} onChange={handleLanguage}>
                  <option value="es">Espanol</option>
                  <option value="en">Ingles</option>
                  <option value="pt">Portugues</option>
                </select>
              </label>
            </article>

            <div className="settings-actions">
              <button type="submit">Guardar configuracion</button>
              {message && <p>{message}</p>}
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default Configuracion
