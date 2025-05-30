import SceneCanvas from './components/SceneCanvas';
import './App.css'; // Lägg till för stil (vi fixar den direkt nedan)

function App() {
  return (
    <div className="app-wrapper">
      <div id="header">COLT</div>
      <SceneCanvas />
    </div>
  );
}

export default App;