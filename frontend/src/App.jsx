import SceneCanvas from './components/SceneCanvas';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Optional Header - add when ready */}
      {/* <header className="header">
        <nav>Navigation content</nav>
      </header>}
      
      {/* 3D Scene Section - takes up specific height */}
      <section className="scene-section">
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
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/gabriel-c-705264a3/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;