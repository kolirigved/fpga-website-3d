import { create } from 'zustand';
import { modules, projects, summary, type Module } from '../data/portfolio';

export type CameraState = 'BOARD_OVERVIEW' | 'BOARD_CLOSEUP' | 'BOARD_TOP' | 'DISPLAY_FOCUS';
export type BoardButton = 'BTNU' | 'BTND' | 'BTNL' | 'BTNR' | 'BTNC' | 'CPU_RESET' | 'PROG';
export type DisplayAttachment = { position: [number, number, number]; normal: [number, number, number]; width: number; height: number };
type State = {
  module: Module; item: number; switches: boolean[]; powered: boolean;
  camera: CameraState; returnCamera: CameraState; transitioning: boolean;
  booting: boolean; reducedMotion: boolean; tooltip: string; pressed: Partial<Record<BoardButton, number>>;
  activityUntil: number; display: DisplayAttachment | null;
  select: (module: Module) => void; toggleSwitch: (index: number) => void;
  step: (delta: number) => void; cycleModule: (delta: number) => void;
  press: (button: BoardButton) => void; power: () => void;
  view: (camera: CameraState) => void; back: () => void; reset: () => void;
  finishBoot: () => void; settle: () => void; setReducedMotion: (value: boolean) => void;
  hint: (text: string) => void; attachDisplay: (display: DisplayAttachment | null) => void;
};
export const useBoard = create<State>((set, get) => ({
  module: 'Home', item: 0, switches: Array(16).fill(false), powered: true,
  camera: 'BOARD_OVERVIEW', returnCamera: 'BOARD_OVERVIEW', transitioning: false,
  booting: false, reducedMotion: false, tooltip: '', pressed: {}, activityUntil: 0, display: null,
  select: module => {
    const switches = [...get().switches];
    for (let i = 0; i < 8; i++) switches[i] = modules[i] === module;
    set({ module, switches, item: 0, activityUntil: Date.now() + 180 });
  },
  toggleSwitch: index => {
    if (index < 0 || index > 15 || !Number.isInteger(index)) return;
    const s = get();
    if (index < 8) s.select(s.switches[index] ? 'Home' : modules[index]);
    else { const switches = [...s.switches]; switches[index] = !switches[index]; set({ switches, activityUntil: Date.now() + 180 }); }
  },
  step: delta => { const s = get(); if (s.module === 'Projects') set({ item: (s.item + delta % projects.length + projects.length) % projects.length, activityUntil: Date.now() + 180 }); else s.cycleModule(delta); },
  cycleModule: delta => { const list: Module[] = ['Home', ...modules]; get().select(list[(list.indexOf(get().module) + delta % list.length + list.length) % list.length]); },
  press: button => {
    const s = get(); set({ pressed: { ...s.pressed, [button]: Date.now() + 180 } });
    if (!s.powered) return;
    if (button === 'BTNL') s.step(-1);
    if (button === 'BTNR') s.step(1);
    if (button === 'BTNU') s.cycleModule(-1);
    if (button === 'BTND') s.cycleModule(1);
    if (button === 'BTNC') s.view(s.camera === 'BOARD_CLOSEUP' ? 'BOARD_OVERVIEW' : 'BOARD_CLOSEUP');
    if (button === 'CPU_RESET' || button === 'PROG') s.reset();
  },
  power: () => set({ powered: !get().powered, booting: false }),
  view: camera => {
    const s = get();
    if (s.transitioning || camera === s.camera || (camera === 'DISPLAY_FOCUS' && !s.display)) return;
    set({ camera, returnCamera: s.camera, transitioning: true, tooltip: '' });
  },
  back: () => {
    const s = get();
    if (s.camera !== 'BOARD_OVERVIEW') set({ camera: 'BOARD_OVERVIEW', transitioning: true, tooltip: '' });
  },
  reset: () => set({ module: 'Home', item: 0, switches: Array(16).fill(false), booting: true, activityUntil: Date.now() + 650 }),
  finishBoot: () => set({ booting: false }), settle: () => set({ transitioning: false }),
  setReducedMotion: reducedMotion => set({ reducedMotion }), hint: tooltip => set({ tooltip }),
  attachDisplay: display => set({ display }),
}));

export const SEGMENTS: Record<string, string> = { '0': 'ABCDEF', '1': 'BC', '2': 'ABDEG', '3': 'ABCDG', '4': 'BCFG', '5': 'ACDFG', '6': 'ACDEFG', '7': 'ABC', '8': 'ABCDEFG', '9': 'ABCDFG', A: 'ABCEFG', B: 'CDEFG', C: 'ADEF', D: 'BCDEG', E: 'ADEFG', F: 'AEFG', ' ': '' };
export function switchRegister(switches: boolean[]) { return switches.reduce((n, on, i) => n | (Number(on) << i), 0); }
export function readout(s: Pick<State, 'powered' | 'booting' | 'module' | 'item' | 'switches'>) {
  if (!s.powered) return '        ';
  if (s.booting) return '88888888';
  const section = s.module === 'Home' ? 0 : modules.indexOf(s.module as typeof modules[number]) + 1;
  return String(section).padStart(2, '0') + String(s.module === 'Projects' ? s.item + 1 : 0).padStart(2, '0') + switchRegister(s.switches).toString(16).toUpperCase().padStart(4, '0');
}
// An external OLED can subscribe to this payload later, independently of the mesh hierarchy.
export function displayPayload(s: Pick<State, 'module' | 'item' | 'powered' | 'switches'>) {
  return { module: s.module, item: s.item, powered: s.powered, register: switchRegister(s.switches), ...summary(s.module, s.item) };
}
