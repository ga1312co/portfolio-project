import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';

function App() {
  return (
    <div style={{ height: "100vh" }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Sphere args={[1, 32, 32]}>
          <meshStandardMaterial color="hotpink" />
        </Sphere>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;