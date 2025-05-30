import { useGLTF } from '@react-three/drei';

export default function WaitingRoomScene() {
  const { scene } = useGLTF('/models/WaitingRoom2.glb');

  return <primitive object={scene} scale={10} />;
}