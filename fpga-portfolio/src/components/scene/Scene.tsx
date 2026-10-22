'use client';
import { Component, Suspense, useEffect, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import Hardware from './Hardware';
import CameraController from './CameraController';
import ReflectingFloor from './ReflectingFloor';
import AtmosphereParticles from './AtmosphereParticles';

function Fallback({ onReady }: { onReady: (ready: boolean) => void }) {
  useEffect(() => onReady(false), [onReady]);
  return (
    <div className="scene-message">
      <p>3D rendering is unavailable.</p>
      <span>Enable WebGL or try another browser to explore the board.</span>
    </div>
  );
}

class Boundary extends Component<
  { children: ReactNode; onReady: (ready: boolean) => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Fallback onReady={this.props.onReady} /> : this.props.children;
  }
}

export default function Scene({ onReady }: { onReady: (ready: boolean) => void }) {
  return (
    <Boundary onReady={onReady}>
      <Canvas
        shadows="soft"
        camera={{ position: [10, 24, 16], fov: 38, near: 0.1, far: 180 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        fallback={<Fallback onReady={onReady} />}
        aria-label="Interactive Nexys 4 DDR development board in Ramen Shop blue ambience"
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
        }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 32, 70]} />

        {/* Ambient base illumination */}
        <ambientLight intensity={0.28} />

        {/* Crisp cool-white key directional light for board components and shadows */}
        <directionalLight
          position={[-6, 14, 7]}
          intensity={2.2}
          color="#e0f2fe"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-camera-near={1}
          shadow-camera-far={40}
          shadow-normalBias={0.018}
          shadow-bias={-0.0001}
        />

        {/* Cyberpunk Neon Cyan / Blue rim light */}
        <directionalLight position={[10, 9, -6]} intensity={1.5} color="#c2989b" />

        {/* Deep electric blue secondary accent light */}
        <directionalLight position={[-10, 7, -8]} intensity={1.5} color="#c2989b" />

        <Suspense fallback={null}>
          {/* Cyberpunk blue environment reflections */}
          <Environment resolution={256} background={false} frames={1}>
            {/* Neon Cyan streak */}
            <Lightformer
              form="rect"
              intensity={3.6}
              color="#00d4ff"
              position={[11, 8, 5]}
              rotation={[Math.PI / 3, -0.4, 0]}
              scale={[14, 4, 1]}
            />
            {/* Deep electric blue strip */}
            <Lightformer
              form="rect"
              intensity={2.8}
              color="#0077ff"
              position={[-11, 9, -7]}
              rotation={[Math.PI / 3, 0.4, 0]}
              scale={[12, 4, 1]}
            />
            {/* Soft cyan overhead ambient bar */}
            <Lightformer
              form="rect"
              intensity={1.6}
              color="#38bdf8"
              position={[-4, 11, 3]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[10, 5, 1]}
            />
            {/* Subtle overhead neutral disc */}
            <Lightformer
              form="ring"
              intensity={0.8}
              color="#dbeafe"
              position={[0, 13, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[8, 8, 1]}
            />
          </Environment>

          {/* Seamless reflecting floor without circular table edges */}
          <ReflectingFloor />

          {/* Subtle floating ambient blue particles */}
          <AtmosphereParticles count={90} />

          {/* Interactive FPGA hardware */}
          <Hardware onReady={onReady} />
        </Suspense>

        <CameraController />
      </Canvas>
    </Boundary>
  );
}
