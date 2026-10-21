'use client';
import { Component, Suspense, useEffect, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import Hardware from './Hardware';
import CameraController from './CameraController';

function Fallback({ onReady }: { onReady: (ready: boolean) => void }) {
  useEffect(() => onReady(false), [onReady]);
  return <div className="scene-message"><p>3D rendering is unavailable.</p><span>Enable WebGL or try another browser to explore the board.</span></div>;
}
class Boundary extends Component<{ children: ReactNode; onReady: (ready: boolean) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Fallback onReady={this.props.onReady} /> : this.props.children; }
}
export default function Scene({ onReady }: { onReady: (ready: boolean) => void }) {
  return <Boundary onReady={onReady}><Canvas shadows="soft" camera={{ position: [10,24,16], fov: 38, near: .1, far: 180 }} dpr={[1,1.5]} gl={{ antialias: true, alpha: false }} fallback={<Fallback onReady={onReady} />} aria-label="Interactive Nexys 4 DDR development board" onCreated={({ gl }) => { gl.setClearColor('#000000'); }}>
    <color attach="background" args={['#000000']} />
    <ambientLight intensity={.35} />
    <directionalLight position={[-5,14,8]} intensity={2.8} color="#fff7e9" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={1} shadow-camera-far={40} shadow-normalBias={.018} shadow-bias={-.0001} />
    <directionalLight position={[8,9,-7]} intensity={1.8} color="#d7e5ec" />
    <rectAreaLight position={[-8,6,-4]} rotation={[-Math.PI/2,0,0]} width={9} height={5} intensity={4} color="#d5e4da" />
    <Suspense fallback={null}>
      <Environment resolution={128} background={false} frames={1}>
        <Lightformer form="rect" intensity={1.8} position={[-6,10,3]} rotation={[Math.PI/2,0,0]} scale={[10,8,1]} />
        <Lightformer form="rect" intensity={1.2} position={[7,6,-5]} rotation={[Math.PI/2,0,0]} scale={[8,5,1]} />
      </Environment>
      <Hardware onReady={onReady} />
    </Suspense>
    <CameraController />
  </Canvas></Boundary>;
}
