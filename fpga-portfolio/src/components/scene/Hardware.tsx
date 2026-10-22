'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, BoxGeometry, CanvasTexture, Color, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, SRGBColorSpace, Vector3 } from 'three';
import { modules, summary } from '@/data/portfolio';
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
  if (match) { const i = Number(match[1]); return i === 16 ? 'SW16 · Main power' : i < modules.length ? `SW${i} · ${modules[i]}` : `SW${i} · Input bit ${i}`; }
  return buttonLabels[object.name.replace('_Plunger', '') as BoardButton] ?? object.name;
}
function addOledContacts() {
  const detail = new Group(); detail.name = 'OLED_contacts';
  const gold = new MeshStandardMaterial({ color: '#b77b24', metalness: .72, roughness: .31 });
  // Four visible contacts replace the original dense FPC visual on the live asset.
  for (const z of [1.65, 1.32, .99, .66]) {
    const pin = new Mesh(new BoxGeometry(.20, .052, .065), gold);
    pin.name = 'OLED_4PIN_contact'; pin.position.set(6.115, .37, z); detail.add(pin);
  }
  return detail;
}
export default function Hardware({ onReady }: { onReady: (ready: boolean) => void }) {
  const gltf = useGLTF(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/models/nexys4-ddr.glb`);
  const hovered = useRef<string>('');
  const oledLast = useRef('');
  const fanSpeed = useRef(0);
  const board = useMemo(() => {
    const scene = gltf.scene.clone(true);
    // The shipped GLB predates the latest OLED export. Apply the same enlarged
    // JA/JB placement at runtime so the portfolio always reflects the model source.
    const oldAnchor = new Vector3(9.1644945, .22, 0);
    const newAnchor = new Vector3(9.613, .22, 1.155);
    scene.traverse(o => {
      if (o.name === 'OLED_SCREEN' || o.name.startsWith('Static_OLED_')) {
        o.position.sub(oldAnchor).multiplyScalar(1.32).add(newAnchor);
        o.scale.multiplyScalar(1.32);
      }
      if (o.name === 'Static_OLED_FPC_gold') o.visible = false;
    });
    const oledContacts = addOledContacts(); scene.add(oledContacts);
    const switches: { object: Object3D; index: number; rest: number; travel: number }[] = [];
    const buttons: { object: Object3D; key: BoardButton; rest: number }[] = [];
    const lights: { mesh: Mesh; name: string; material: MeshStandardMaterial }[] = [];
    const segments: { mesh: Mesh; digit: number; segment: string }[] = [];
    const oledMeshes: Mesh[] = [];
    const oledCanvas = document.createElement('canvas'); oledCanvas.width = 1024; oledCanvas.height = 560;
    const oledTexture = new CanvasTexture(oledCanvas); oledTexture.colorSpace = SRGBColorSpace;
    const oledMaterial = new MeshBasicMaterial({ map: oledTexture, toneMapped: false });
    const controlMaterials: { name: string; material: MeshStandardMaterial }[] = [];
    const off = new MeshStandardMaterial({ color: '#41423b', roughness: .58 });
    const on = new MeshStandardMaterial({ color: '#400c08', emissive: '#ff2012', emissiveIntensity: 2.4, roughness: .5, toneMapped: false });
    scene.traverse(o => {
      const sw = o.name.match(/^SW(\d+)_Slider$/);
      if (sw) switches.push({ object: o, index: Number(sw[1]), rest: o.position.z, travel: Number(o.userData.travel ?? .38) });
      if (o.name.endsWith('_Plunger')) buttons.push({ object: o, key: o.name.replace('_Plunger', '') as BoardButton, rest: o.position.y });
      if (!(o instanceof Mesh)) return;
      o.castShadow = true; o.receiveShadow = true;
      if (o.name === 'OLED_SCREEN') { o.material = oledMaterial; oledMeshes.push(o); return; }
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
    return { scene, oledContacts, switches, buttons, lights, segments, oledMeshes, oledCanvas, oledTexture, controlMaterials, on, off };
  }, [gltf.scene]);
  useEffect(() => {
    const screen = board.oledMeshes[0];
    if (screen) {
      board.scene.updateMatrixWorld(true);
      if (!screen.geometry.boundingBox) screen.geometry.computeBoundingBox();
      const normalAttribute = screen.geometry.getAttribute('normal');
      const normal = normalAttribute ? new Vector3().fromBufferAttribute(normalAttribute, 0).transformDirection(screen.matrixWorld) : new Vector3(0, 1, 0);
      const bounds = new Box3().setFromObject(screen), position = bounds.getCenter(new Vector3()), size = bounds.getSize(new Vector3());
      const width = Math.abs(normal.y) > .8 ? Math.max(size.x, size.z) : Math.abs(normal.x) > .8 ? Math.max(size.y, size.z) : Math.max(size.x, size.y);
      const height = Math.abs(normal.y) > .8 ? Math.min(size.x, size.z) : Math.abs(normal.x) > .8 ? Math.min(size.y, size.z) : Math.min(size.x, size.y);
      // The display lies flat with its connector on the left toward the FPGA.
      useBoard.getState().attachDisplay({ position: position.toArray() as [number, number, number], normal: normal.toArray() as [number, number, number], up: [0, 0, -1], width: width || 4.09, height: height || 2.25 });
    }
    onReady(true);
    return () => { useBoard.getState().attachDisplay(null); board.on.dispose(); board.off.dispose(); board.oledTexture.dispose(); board.oledMeshes.forEach(m => (m.material as MeshBasicMaterial).dispose()); board.lights.forEach(l => l.material.dispose()); board.controlMaterials.forEach(m => m.material.dispose()); board.oledContacts.traverse(o => { if (o instanceof Mesh) { o.geometry.dispose(); (o.material as MeshStandardMaterial).dispose(); } }); };
  }, [board, onReady]);
  const green = useMemo(() => new Color('#84ba38'), []);
  const fanRotor = useMemo(() => board.scene.getObjectByName('CoolingFan_Rotor_Hub') ?? null, [board]);
  useFrame((_, dt) => {
    const s = useBoard.getState(), now = Date.now(), text = readout(s);
    fanSpeed.current += ((s.powered && !s.reducedMotion ? 1 : 0) - fanSpeed.current) * Math.min(dt * 3, 1);
    if (fanRotor) fanRotor.rotation.y += dt * fanSpeed.current * 18;
    const oledKey = `${s.module}:${s.item}:${s.powered}:${s.booting}:${text}`;
    const ctx = oledKey !== oledLast.current ? board.oledCanvas.getContext('2d') : null;
    if (ctx) {
      const content = summary(s.module, s.item);
      ctx.fillStyle = '#020807'; ctx.fillRect(0, 0, 1024, 560);
      ctx.strokeStyle = '#174538'; ctx.lineWidth = 3; ctx.strokeRect(20, 20, 984, 520);
      ctx.fillStyle = '#55e9ad'; ctx.font = '600 28px ui-monospace, monospace'; ctx.fillText('RIGVED KOLI  /  FPGA WORKBENCH', 54, 68);
      ctx.strokeStyle = '#24634c'; ctx.beginPath(); ctx.moveTo(54, 92); ctx.lineTo(970, 92); ctx.stroke();
      ctx.fillStyle = s.powered ? '#d1ffe8' : '#65746c'; ctx.font = '700 56px ui-monospace, monospace'; ctx.fillText(s.powered ? content.title.toUpperCase() : 'SYSTEM OFF', 54, 180, 890);
      ctx.fillStyle = '#70c99e'; ctx.font = '28px ui-monospace, monospace'; ctx.fillText(s.powered ? content.subtitle.toUpperCase() : 'TOGGLE POWER TO RESTART', 54, 236, 900);
      ctx.fillStyle = '#a1cbb2'; ctx.font = '24px ui-monospace, monospace';
      const detail = s.powered ? content.detail.toUpperCase() : '';
      ctx.fillText(detail.slice(0, 52), 54, 300);
      ctx.fillText(detail.slice(52, 104), 54, 340);
      ctx.fillStyle = '#55e9ad'; ctx.font = '600 22px ui-monospace, monospace';
      ctx.fillText(`MODULE ${modules.indexOf(s.module as typeof modules[number]) + 1 || 'HOME'}  ·  7-SEG ${text}`, 54, 476);
      ctx.fillStyle = '#609078'; ctx.font = '20px ui-monospace, monospace'; ctx.fillText('JA + JB / 4-PIN LINK  ·  OLED 128 × 64', 54, 514);
      board.oledTexture.needsUpdate = true;
      oledLast.current = oledKey;
    }
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
      light.material.emissive.copy(green); light.material.emissiveIntensity = enabled ? 1.8 : 0;
    }
    for (const entry of board.controlMaterials) {
      entry.material.emissive.set('#8eaaa2'); entry.material.emissiveIntensity = hovered.current === entry.name ? .12 : 0;
    }
  });
  const hover = (e: ThreeEvent<PointerEvent>) => {
    if (e.object.name === 'OLED_SCREEN') { e.stopPropagation(); hovered.current='OLED_SCREEN'; useBoard.getState().hint('Portfolio OLED · click to focus'); return; }
    const c = controlFor(e.object); if (!c) { hovered.current=''; useBoard.getState().hint(''); return; }
    e.stopPropagation(); hovered.current = c.name; useBoard.getState().hint(label(c));
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (e.object.name === 'OLED_SCREEN' && e.delta <= 4) { e.stopPropagation(); useBoard.getState().view('DISPLAY_FOCUS'); return; }
    const c = controlFor(e.object); if (!c || e.delta > 4) return;
    e.stopPropagation(); const s = useBoard.getState(); const match = c.name.match(/^SW(\d+)_Slider$/);
    if (match) { const i = Number(match[1]); if (i === 16) s.power(); else s.toggleSwitch(i); }
    else s.press(c.name.replace('_Plunger','') as BoardButton);
  };
  return <primitive object={board.scene} onPointerMove={hover} onPointerOut={() => { hovered.current='';useBoard.getState().hint(''); }} onClick={click} dispose={null} />;
}
