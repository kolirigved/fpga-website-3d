'use client';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { PerspectiveCamera, Vector3 } from 'three';
import { useBoard, type CameraState } from '@/state/board';

type Pose = { position: Vector3; target: Vector3; up: Vector3 };
export default function CameraController() {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const mode = useBoard(s => s.camera), moving = useBoard(s => s.transitioning);
  const reduced = useBoard(s => s.reducedMotion);
  const zoomTrigger = useBoard(s => s.zoomTrigger);
  const lastZoom = useRef(0);
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
      const target = new Vector3(2.5, .2, 0);
      const distance = fit(18.8, 14.5);
      return { target, position: target.clone().add(new Vector3(.34, .81, .53).normalize().multiplyScalar(distance)), up: new Vector3(0, 1, 0) };
    };
    let pose: Pose = overview();
    if (changed && previous.current === 'BOARD_OVERVIEW') saved.current = { position: camera.position.clone(), target: c.target.clone(), up: camera.up.clone() };
    if (mode === 'DISPLAY_FOCUS' && changed) saved.current = { position: camera.position.clone(), target: c.target.clone(), up: camera.up.clone() };
    if (mode === 'BOARD_TOP') { pose = { target: new Vector3(0, 0, 0), position: new Vector3(0, fit(13.4, 12.8), .01), up: new Vector3(0, 0, -1) }; }
    if (mode === 'BOARD_CLOSEUP') {
      const target = new Vector3(-.7, .3, 3.75);
      pose = { target, position: target.clone().add(new Vector3(.05, .96, .28).normalize().multiplyScalar(fit(13.6, 5.4))), up: new Vector3(0, 1, 0) };
    }
    if (mode === 'DISPLAY_FOCUS') {
      const d = useBoard.getState().display;
      if (d) {
        // A flat OLED faces world +Y, so Three's default +Y camera-up vector
        // becomes parallel to the view direction. Use the module's transformed
        // screen-up direction while focused; restore world-up on return.
        const up = new Vector3(...(d.up ?? [0, 0, -1])).normalize();
        const target = new Vector3(...d.position);
        pose = { target, position: target.clone().add(new Vector3(...d.normal).normalize().multiplyScalar(fit(d.width, d.height))), up };
      }
    }
    if (previous.current === 'DISPLAY_FOCUS' && changed && saved.current && !resized) pose = saved.current;
    else if (mode === 'BOARD_OVERVIEW' && changed && saved.current && !resized) pose = saved.current;
    if (first) { camera.position.copy(pose.position); camera.up.copy(pose.up); c.target.copy(pose.target); camera.lookAt(c.target); c.update(); }
    else motion.current = { from: { position: camera.position.clone(), target: c.target.clone(), up: camera.up.clone() }, to: pose, elapsed: 0 };
    previous.current = mode;
  }, [camera, size.width, size.height, mode]);
  useFrame((_, dt) => {
    const m = motion.current, c = controls.current; if (!m || !c) return;
    m.elapsed += dt;
    const t = reduced ? 1 : Math.min(m.elapsed / 1.5, 1);
    const ease = t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    camera.position.lerpVectors(m.from.position, m.to.position, ease);
    c.target.lerpVectors(m.from.target, m.to.target, ease);
    camera.up.lerpVectors(m.from.up, m.to.up, ease).normalize();
    camera.lookAt(c.target);
    if (t === 1) { motion.current = null; useBoard.getState().settle(); }
  });

  useEffect(() => {
    if (zoomTrigger === lastZoom.current) return;
    const isZoomIn = zoomTrigger > lastZoom.current;
    lastZoom.current = zoomTrigger;
    const c = controls.current; if (!c || moving || mode === 'DISPLAY_FOCUS') return;
    const offset = camera.position.clone().sub(c.target);
    const len = offset.length();
    const minD = mode === 'BOARD_CLOSEUP' ? 3 : mode === 'BOARD_TOP' ? 6 : 5;
    const maxD = mode === 'BOARD_CLOSEUP' ? 14 : mode === 'BOARD_TOP' ? 32 : 46;
    const nextLen = Math.max(minD, Math.min(maxD, isZoomIn ? len * 0.8 : len * 1.25));
    offset.setLength(nextLen);
    camera.position.copy(c.target).add(offset);
    c.update();
  }, [zoomTrigger, camera, moving, mode]);

  const free = moving || mode === 'DISPLAY_FOCUS' || mode === 'BOARD_TOP';
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={!moving && mode !== 'DISPLAY_FOCUS'}
      enablePan={false}
      enableZoom={!moving && mode !== 'DISPLAY_FOCUS'}
      zoomSpeed={0.8}
      minDistance={mode === 'BOARD_CLOSEUP' ? 3 : mode === 'BOARD_TOP' ? 6 : 5}
      maxDistance={mode === 'BOARD_CLOSEUP' ? 14 : mode === 'BOARD_TOP' ? 32 : 46}
      enableDamping={!reduced}
      dampingFactor={0.06}
      rotateSpeed={0.55}
      minPolarAngle={free ? 0.001 : 0.12}
      maxPolarAngle={free ? Math.PI : 1.15}
      minAzimuthAngle={free ? -Infinity : -0.85}
      maxAzimuthAngle={free ? Infinity : 0.85}
    />
  );
}
