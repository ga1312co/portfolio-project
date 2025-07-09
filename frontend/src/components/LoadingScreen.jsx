import { useEffect, useState } from 'react';
import '../styles/LoadingScreen.css';

export default function LoadingScreen({ isReady, onEnter, transitioning, sceneReady, dataReady }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      let currentProgress = 0;
      if (dataReady) {
        currentProgress += 50;
      }
      if (sceneReady) {
        currentProgress += 50;
      }
      setProgress(currentProgress);
    };

    calculateProgress();
  }, [dataReady, sceneReady]);

  return (
    <div className={`loading-screen${transitioning ? ' loading-screen-exit' : ''}`}>
      <div className="loading-content">
        <div className={`text-container${transitioning ? ' fade-out' : ''}`}>
          <h1 className="fade-in-1">Welcome to the Waiting Room.</h1>
          <h2 className="fade-in-2">Software Development Portfolio Page of</h2>
          <h3 className="fade-in-3">Gabriel Colt, Informatics Student</h3>
        </div>
        <div className="loading-image-glow">
          <img
            src="/images/waiting_room.png"
            alt="Loading..."
            className={`loading-image${transitioning ? ' fade-out' : ''}`}
          />
        </div>
        <div className={`loading-bar-container${transitioning ? ' fade-out' : ''}`}>
          <div className="loading-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <button
          className={`enter-button${transitioning ? ' fade-out' : ''}`}
          onClick={onEnter}
          disabled={!isReady || transitioning}
        >
          {isReady ? 'Enter Waiting Room' : 'Loading...'}
        </button>
      </div>
    </div>
  );
}
