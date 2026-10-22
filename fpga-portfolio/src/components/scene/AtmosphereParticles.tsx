'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, Float32BufferAttribute } from 'three';

export default function AtmosphereParticles({ count = 100 }: { count?: number }) {
  const pointsRef = useRef<Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = Math.random() * 7.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;

      spd[i * 3 + 0] = (Math.random() - 0.5) * 0.12;
      spd[i * 3 + 1] = 0.08 + Math.random() * 0.16;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
    }
    return [pos, spd];
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((_, dt) => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position as Float32BufferAttribute;
    const array = attr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 0] += speeds[i * 3 + 0] * dt;
      array[i * 3 + 1] += speeds[i * 3 + 1] * dt;
      array[i * 3 + 2] += speeds[i * 3 + 2] * dt;

      if (array[i * 3 + 1] > 8.0) {
        array[i * 3 + 1] = 0.1;
        array[i * 3 + 0] = (Math.random() - 0.5) * 20;
        array[i * 3 + 2] = (Math.random() - 0.5) * 16;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.075}
        color="#38bdf8"
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  );
}
