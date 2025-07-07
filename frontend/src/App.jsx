import { useState, useEffect } from 'react';
import SceneCanvas from './components/SceneCanvas';
import LoadingScreen from './components/LoadingScreen';
import { apiService } from './services/api';
import './styles/App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    async function checkInitialData() {
      try {
        // Fetch initial data from the API
        await apiService.getProjects();
        await apiService.getExperiences();
        setDataReady(true);
      } catch (error) {
        console.error("API not ready yet", error);
        // Retry after a short delay
        setTimeout(checkInitialData, 1000);
      }
    }
    checkInitialData();
  }, []);

  useEffect(() => {
    if (sceneReady && dataReady) {
      // Small delay to ensure everything is properly loaded
      setTimeout(() => setIsReady(true), 500);
    }
  }, [sceneReady, dataReady]);

  const handleEnter = () => {
    setIsTransitioning(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="app-container">
      {isLoading && (
        <LoadingScreen
          isReady={isReady}
          onEnter={handleEnter}
          transitioning={isTransitioning}
        />
      )}

      {/* 3D Scene Section */}
      <section
        className={`scene-section${isTransitioning ? ' scene-fade-in' : ''}`}
        id="home"
      >
        <SceneCanvas onSceneReady={() => setSceneReady(true)} />
      </section>
      {/* Footer Section */}
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