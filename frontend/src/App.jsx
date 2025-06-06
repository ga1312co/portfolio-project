import SceneCanvas from './components/SceneCanvas';
import './App.css';

function App() {
  return (
    <>
      {/* 3D Scene area - takes up 400vh for camera movement */}
      <div className="scene-wrapper">
        <div className="canvas-container">
          <SceneCanvas />
        </div>
      </div>
      
      {/* Footer appears after the 3D journey */}
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
    </>
  );
}

export default App;