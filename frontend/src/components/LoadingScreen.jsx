import '../styles/LoadingScreen.css';

export default function LoadingScreen({ isReady, onEnter, transitioning }) {
  return (
    <div className={`loading-screen${transitioning ? ' loading-screen-exit' : ''}`}>
      <div className="loading-content">
        <h1 className={`loading-title${transitioning ? ' fade-out' : ''}`}>
          Welcome to the Waiting Room - Gabriel Colt's portfolio page.
        </h1>
        <div className="loading-image-glow">
          <img
            src="/images/waiting_room.png"
            alt="Loading..."
            className={`loading-image${transitioning ? ' fade-out' : ''}`}
          />
        </div>
        <div className={`loading-bar-container${transitioning ? ' fade-out' : ''}`}>
          <div className={`loading-bar ${isReady ? 'ready' : ''}`}></div>
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
