import '../Style/Home.css'
import { Link } from 'react-router-dom'
import Navbar from '../Organism/Navbar'
import Footer from '../Organism/Footer'
import raton_lloron from '../../assets/Logos/raton_lloron.webp'


function Home() {
  return (
    <div className="home-page">
      <Navbar />

      <main className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">Bienvenido</p>
          <h1>Página de inicio </h1>
          <p className="hero-text">
            El futuro es hoy viejo.
          </p>
          <div className="hero-buttons">
            <Link to="/login"><button type="button" className="button-primary">Comenzar</button></Link>
            <Link to="/crear-cuenta"><button type="button" className="button-secondary">Saber más</button></Link>
          </div>
        </div>

        <div className="hero-illustration">
            <img src={raton_lloron} alt="ratón llorando" className="hero-image" />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Home 