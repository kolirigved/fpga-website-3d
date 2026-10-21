'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Color, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { modules } from '@/data/portfolio';
import { useBoard, readout, SEGMENTS, type BoardButton } from '@/state/board';

const buttonLabels: Record<BoardButton, string> = { BTNU: 'Previous section', BTND: 'Next section', BTNL: 'Previous item', BTNR: 'Next item', BTNC: 'Inspect controls', CPU_RESET: 'Reset board', PROG: 'Reconfigure / segment test' };
function controlFor(object: Object3D): Object3D | null {
  let current: Object3D | null = object;
  while (current) {
    if (/^SW\d+_Slider$|_Plunger$/.test(current.name)) return current;
    current = current.parent;
  }
  return null;
}
function label(object: Object3D) {
  const match = object.name.match(/^SW(\d+)_Slider$/);
  if (match) { const i = Number(match[1]); return i === 16 ? 'SW16 · Main power' : i < 8 ? `SW${i} · ${modules[i]}` : `SW${i} · Input bit ${i}`; }
  return buttonLabels[object.name.replace('_Plunger', '') as BoardButton] ?? object.name;
}
export default function Hardware({ onReady }: { onReady: (ready: boolean) => void }) {
  const gltf = useGLTF('/models/nexys4-ddr.glb');
  const hovered = useRef<string>('');
  const board = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const switches: { object: Object3D; index: number; rest: number; travel: number }[] = [];
    const buttons: { object: Object3D; key: BoardButton; rest: number }[] = [];
    const lights: { mesh: Mesh; name: string; material: MeshStandardMaterial }[] = [];
    const segments: { mesh: Mesh; digit: number; segment: string }[] = [];
    const controlMaterials: { name: string; material: MeshStandardMaterial }[] = [];
    const off = new MeshStandardMaterial({ color: '#41423b', roughness: .58 });
    const on = new MeshStandardMaterial({ color: '#400c08', emissive: '#ff2012', emissiveIntensity: .75, roughness: .5, toneMapped: false });
    scene.traverse(o => {
      const sw = o.name.match(/^SW(\d+)_Slider$/);
      if (sw) switches.push({ object: o, index: Number(sw[1]), rest: o.position.z, travel: Number(o.userData.travel ?? .38) });
      if (o.name.endsWith('_Plunger')) buttons.push({ object: o, key: o.name.replace('_Plunger', '') as BoardButton, rest: o.position.y });
      if (!(o instanceof Mesh)) return;
      o.castShadow = true; o.receiveShadow = true;
      const seg = o.name.match(/^Digit(\d)_Segment(A|B|C|D|E|F|G|DP)$/);
      if (seg) { segments.push({ mesh: o, digit: Number(seg[1]), segment: seg[2] }); o.material = off; return; }
      if (/^LED\d+$|_LED$|^RGB\d+$|^UART_/.test(o.name)) {
        const m = (o.material as MeshStandardMaterial).clone(); o.material = m; lights.push({ mesh: o, name: o.name, material: m }); return;
      }
      const control = controlFor(o);
      if (control) {
        const m = (o.material as MeshStandardMaterial).clone(); o.material = m;
        controlMaterials.push({ name: control.name, material: m });
      }
    });
    return { scene, switches, buttons, lights, segments, controlMaterials, on, off };
  }, [gltf.scene]);
  useEffect(() => {
    onReady(true);
    return () => { board.on.dispose(); board.off.dispose(); board.lights.forEach(l => l.material.dispose()); board.controlMaterials.forEach(m => m.material.dispose()); };
  }, [board, onReady]);
  const green = useMemo(() => new Color('#84ba38'), []);
  useFrame((_, dt) => {
    const s = useBoard.getState(), now = Date.now(), text = readout(s);
    for (const sw of board.switches) {
      const active = sw.index === 16 ? s.powered : s.switches[sw.index];
      // Power switch was modeled in its ON position; user switches start OFF.
      const target = sw.index === 16 ? sw.rest + (active ? 0 : sw.travel) : sw.rest - (active ? sw.travel : 0);
      sw.object.position.z += (target-sw.object.position.z) * (s.reducedMotion ? 1 : Math.min(dt*22, 1));
    }
    for (const button of board.buttons) {
      const target = button.rest - ((s.pressed[button.key] ?? 0) > now ? .055 : 0);
      button.object.position.y += (target-button.object.position.y) * (s.reducedMotion ? 1 : Math.min(dt*28, 1));
    }
    for (const seg of board.segments) {
      const enabled = s.powered && (seg.segment === 'DP' ? s.booting || seg.digit === 6 || seg.digit === 4 : (SEGMENTS[text[7-seg.digit]] ?? '').includes(seg.segment));
      seg.mesh.material = enabled ? board.on : board.off;
    }
    for (const light of board.lights) {
      const user = light.name.match(/^LED(\d+)$/);
      const enabled = s.powered && (user ? s.booting || s.switches[Number(user[1])] : light.name === 'POWER_LED' || light.name === 'DONE_LED' && !s.booting || light.name === 'RGB16' && s.module !== 'Home' || light.name === 'BUSY_LED' && s.activityUntil > now);
      light.material.color.set(enabled ? '#98b75f' : '#465035');
      light.material.emissive.copy(green); light.material.emissiveIntensity = enabled ? .85 : 0;
    }
    for (const entry of board.controlMaterials) {
      entry.material.emissive.set('#8eaaa2'); entry.material.emissiveIntensity = hovered.current === entry.name ? .12 : 0;
    }
  });
  const hover = (e: ThreeEvent<PointerEvent>) => {
    const c = controlFor(e.object); if (!c) { hovered.current=''; useBoard.getState().hint(''); return; }
    e.stopPropagation(); hovered.current = c.name; useBoard.getState().hint(label(c));
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    const c = controlFor(e.object); if (!c || e.delta > 4) return;
    e.stopPropagation(); const s = useBoard.getState(); const match = c.name.match(/^SW(\d+)_Slider$/);
    if (match) { const i = Number(match[1]); if (i === 16) s.power(); else s.toggleSwitch(i); }
    else s.press(c.name.replace('_Plunger','') as BoardButton);
  };
  return <primitive object={board.scene} onPointerMove={hover} onPointerOut={() => { hovered.current='';useBoard.getState().hint(''); }} onClick={click} dispose={null} />;
}
