import SceneCanvas from './components/SceneCanvas';
import './styles/App.css';

function App() {
  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="header">
        <nav className="nav">
          <div className="nav-brand">
            <h1>Gabriels Portfolio</h1>
          </div>
        </nav>
      </header>
      
      {/* 3D Scene Section - takes up specific height */}
      <section className="scene-section" id="home">
        <SceneCanvas />
      </section>
      
      {/* Footer Section - appears below the scene */}
      <footer className="footer">
        <div className="footer-content">
          <h2>Contact</h2>
          <div className="contact-info">
            <p>📧 carlgabrielcolt@gmail.com</p>
            <p>📍 Malmö, Sweden</p>
          </div>
          <div className="social-links">
            <a href="https://github.com/ga1312co" target="_blank" rel="noopener noreferrer">
              <img src="/images/github_logo.png" alt="GitHub" style={{ width: 28, height: 28, verticalAlign: 'middle' }} />
            </a>
            <a href="https://www.linkedin.com/in/gabriel-c-705264a3/" target="_blank" rel="noopener noreferrer">
              <img src="/images/linkedin_logo.svg" alt="LinkedIn" style={{ width: 28, height: 28, verticalAlign: 'middle' }} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;