'use client';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { PerspectiveCamera, Vector3 } from 'three';
import { useBoard, type CameraState } from '@/state/board';

type Pose = { position: Vector3; target: Vector3 };
export default function CameraController() {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const mode = useBoard(s => s.camera), moving = useBoard(s => s.transitioning);
  const reduced = useBoard(s => s.reducedMotion);
  const previous = useRef<CameraState>('BOARD_OVERVIEW');
  const saved = useRef<Pose | null>(null);
  const viewport = useRef('');
  const motion = useRef<{ from: Pose; to: Pose; elapsed: number } | null>(null);
  useEffect(() => {
    const c = controls.current; if (!c) return;
    const key = `${size.width}:${size.height}`, first = !viewport.current, resized = key !== viewport.current;
    viewport.current = key;
    const changed = mode !== previous.current;
    if (!changed && !resized) return;
    const aspect = size.width / size.height;
    const fit = (width: number, height: number) => Math.max(width / (aspect * .82), height / .76) / (2 * Math.tan((camera as PerspectiveCamera).fov * Math.PI / 360));
    const overview = (): Pose => {
      const target = new Vector3(0, .2, 0);
      const distance = fit(15.5, 14.5);
      return { target, position: target.clone().add(new Vector3(.34, .81, .53).normalize().multiplyScalar(distance)) };
    };
    let pose = overview();
    if (changed && previous.current === 'BOARD_OVERVIEW') saved.current = { position: camera.position.clone(), target: c.target.clone() };
    if (mode === 'BOARD_TOP') { pose = { target: new Vector3(0, 0, 0), position: new Vector3(0, fit(13.4, 12.8), .01) }; }
    if (mode === 'BOARD_CLOSEUP') {
      const target = new Vector3(-.7, .3, 3.75);
      pose = { target, position: target.clone().add(new Vector3(.05, .96, .28).normalize().multiplyScalar(fit(13.6, 5.4))) };
    }
    if (mode === 'DISPLAY_FOCUS') {
      const d = useBoard.getState().display;
      if (d) { const target = new Vector3(...d.position); pose = { target, position: target.clone().add(new Vector3(...d.normal).normalize().multiplyScalar(fit(d.width, d.height))) }; }
    }
    if (mode === 'BOARD_OVERVIEW' && changed && saved.current && !resized) pose = saved.current;
    if (first) { camera.position.copy(pose.position); c.target.copy(pose.target); camera.lookAt(c.target); c.update(); }
    else motion.current = { from: { position: camera.position.clone(), target: c.target.clone() }, to: pose, elapsed: 0 };
    previous.current = mode;
  }, [camera, size.width, size.height, mode]);
  useFrame((_, dt) => {
    const m = motion.current, c = controls.current; if (!m || !c) return;
    m.elapsed += dt;
    const t = reduced ? 1 : Math.min(m.elapsed / 1.35, 1);
    const ease = t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    camera.position.lerpVectors(m.from.position, m.to.position, ease);
    c.target.lerpVectors(m.from.target, m.to.target, ease);
    camera.lookAt(c.target);
    if (t === 1) { motion.current = null; useBoard.getState().settle(); }
  });
  const free = moving || mode === 'DISPLAY_FOCUS' || mode === 'BOARD_TOP';
  return <OrbitControls ref={controls} makeDefault enabled={!moving && mode !== 'DISPLAY_FOCUS'} enablePan={false} enableZoom={false} enableDamping={!reduced && !free} rotateSpeed={.55} minPolarAngle={free ? .001 : .12} maxPolarAngle={free ? Math.PI : 1.1} minAzimuthAngle={free ? -Infinity : -.8} maxAzimuthAngle={free ? Infinity : .8} />;
}
