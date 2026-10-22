'use client';
import { MeshReflectorMaterial } from '@react-three/drei';

export default function ReflectingFloor() {
  return (
    <group position={[0, -0.32, 0]}>
      {/* Seamless dark floor backing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[140, 140]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Seamless reflecting floor - no circular table edges visible */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mirror={0.65}
          mixBlur={0.85}
          mixStrength={18}
          roughness={0.45}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#02070f"
          metalness={0.75}
        />
      </mesh>
    </group>
  );
}
