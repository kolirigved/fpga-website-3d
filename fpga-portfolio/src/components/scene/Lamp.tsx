'use client';
import { useMemo, useRef } from 'react';
import { Object3D, Vector3 } from 'three';

export default function Lamp({ position = [-8.8, -0.32, -2.8] }: { position?: [number, number, number] }) {
  const target = useMemo(() => {
    const o = new Object3D();
    o.position.set(0, 0.2, 0); // Focus onto the FPGA board center
    return o;
  }, []);

  // Compute lamp head position relative to lamp base
  // Base at [0, 0, 0] local -> stem up 3.8 -> arm reaches inwards ~+2.8 in X and +1.8 in Z, Y ~4.6
  const shadePos = useMemo(() => new Vector3(2.6, 4.6, 1.6), []);
  const shadeWorldPos: [number, number, number] = [
    position[0] + shadePos.x,
    position[1] + shadePos.y,
    position[2] + shadePos.z,
  ];

  return (
    <group position={position}>
      <primitive object={target} />

      {/* Heavy circular cast-metal base resting on the reflective floor */}
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.1, 0.14, 32]} />
        <meshStandardMaterial color="#14171a" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Brass accent trim on base */}
      <mesh position={[0, 0.145, 0]}>
        <cylinderGeometry args={[0.7, 0.75, 0.05, 32]} />
        <meshStandardMaterial color="#d4a359" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Lower vertical riser rod */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 3.6, 16]} />
        <meshStandardMaterial color="#1a1d21" roughness={0.35} metalness={0.85} />
      </mesh>

      {/* Mid mechanical knuckle joint */}
      <mesh position={[0, 3.75, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#d4a359" roughness={0.25} metalness={0.92} />
      </mesh>
      {/* Knuckle tension screw */}
      <mesh position={[0.18, 3.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 12]} />
        <meshStandardMaterial color="#22262b" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Upper cantilever arm angled toward the FPGA board */}
      <group position={[0, 3.75, 0]} rotation={[0.3, -0.45, -0.55]}>
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.065, 3.3, 16]} />
          <meshStandardMaterial color="#1a1d21" roughness={0.35} metalness={0.85} />
        </mesh>
      </group>

      {/* Lamp head assembly positioned at the end of the cantilever */}
      <group position={[shadePos.x, shadePos.y, shadePos.z]}>
        {/* Elbow swivel joint */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#d4a359" roughness={0.25} metalness={0.92} />
        </mesh>

        {/* Lamp shade pointing down-right toward the board */}
        <group rotation={[0.45, -0.3, 0.6]}>
          {/* Main conical shade */}
          <mesh position={[0, -0.4, 0]} castShadow>
            <cylinderGeometry args={[0.28, 1.05, 1.1, 32, 1, false]} />
            <meshStandardMaterial color="#121519" roughness={0.38} metalness={0.75} />
          </mesh>

          {/* Inner reflective warm brass lining */}
          <mesh position={[0, -0.41, 0]} scale={[0.97, 0.98, 0.97]}>
            <cylinderGeometry args={[0.27, 1.02, 1.08, 32, 1, true]} />
            <meshStandardMaterial color="#e8b868" roughness={0.22} metalness={0.88} />
          </mesh>

          {/* Cyberpunk neon accent ring around shade rim (Ramen Shop signature) */}
          <mesh position={[0, -0.96, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.06, 0.022, 16, 32]} />
            <meshBasicMaterial color="#ff2fd5" toneMapped={false} />
          </mesh>

          {/* Glowing frosted bulb inside shade */}
          <mesh position={[0, -0.28, 0]}>
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshBasicMaterial color="#fff3d1" toneMapped={false} />
          </mesh>
        </group>

        {/* Local point light at bulb for shade interior and ambient fill */}
        <pointLight color="#ffc67d" intensity={2.4} distance={7} decay={2} />
      </group>

      {/* SpotLight aimed directly onto the FPGA board */}
      <spotLight
        position={shadeWorldPos}
        target={target}
        color="#fff0ce"
        intensity={9}
        angle={Math.PI / 3.8}
        penumbra={0.65}
        distance={24}
        decay={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
    </group>
  );
}
