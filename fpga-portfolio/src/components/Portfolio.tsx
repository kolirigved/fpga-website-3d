'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { modules, profile, summary } from '@/data/portfolio';
import { useBoard, readout, type BoardButton } from '@/state/board';
const Scene = dynamic(() => import('./scene/Scene'), { ssr: false });

export default function Portfolio() {
  const state = useBoard();
  const [ready, setReady] = useState<boolean | null>(null);
  const [controls, setControls] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => useBoard.getState().setReducedMotion(query.matches);
    sync(); query.addEventListener('change', sync); return () => query.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (!state.booting) return;
    const timer = setTimeout(state.finishBoot, state.reducedMotion ? 100 : 650);
    return () => clearTimeout(timer);
  }, [state.booting, state.reducedMotion, state.finishBoot]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { useBoard.getState().back(); setControls(false); return; }
      if ((e.target as HTMLElement).closest('button,a,input,select,textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
      const s = useBoard.getState();
      const keys: Record<string, BoardButton> = { ArrowLeft:'BTNL',ArrowRight:'BTNR',ArrowUp:'BTNU',ArrowDown:'BTND',Enter:'BTNC',r:'CPU_RESET' };
      if (keys[e.key]) { e.preventDefault(); s.press(keys[e.key]); }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); s.zoomIn(); }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); s.zoomOut(); }
      if (/^[1-7]$/.test(e.key)) s.toggleSwitch(Number(e.key)-1);
    };
    window.addEventListener('keydown',key);return () => window.removeEventListener('keydown',key);
  }, []);
  const content = summary(state.module,state.item);
  return <main suppressHydrationWarning className={`board-experience ${state.tooltip ? 'is-hovering' : ''}`} data-camera={state.camera} data-moving={state.transitioning} data-ready={ready === true}>
    <div className="scene-wrap"><Scene onReady={setReady} /></div>
    <header className="corner-label"><span className="owner-name">RIGVED KOLI</span><h1>Nexys 4 DDR<span>Interactive workbench</span></h1></header>
    <nav className="profile-links" aria-label="Professional links">
      <a href={profile.links.github} target="_blank" rel="noreferrer">GitHub</a>
      <a href={profile.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
      <a href={profile.links.email}>Email</a>
      <a href={profile.links.resume} target="_blank" rel="noreferrer">Résumé</a>
    </nav>
    <nav className="view-controls" aria-label="Camera controls">
      {state.camera !== 'BOARD_OVERVIEW' && <button onClick={state.back}>← Back to board</button>}
      <button aria-pressed={state.camera === 'BOARD_TOP'} disabled={state.transitioning} onClick={() => state.view(state.camera === 'BOARD_TOP' ? 'BOARD_OVERVIEW' : 'BOARD_TOP')}>Top view</button>
      <button aria-pressed={state.camera === 'BOARD_CLOSEUP'} disabled={state.transitioning} onClick={() => state.view(state.camera === 'BOARD_CLOSEUP' ? 'BOARD_OVERVIEW' : 'BOARD_CLOSEUP')}>Inspect I/O</button>
      <div className="zoom-controls">
        <button aria-label="Zoom in" title="Zoom in (+)" disabled={state.transitioning || state.camera === 'DISPLAY_FOCUS'} onClick={state.zoomIn}>+</button>
        <button aria-label="Zoom out" title="Zoom out (−)" disabled={state.transitioning || state.camera === 'DISPLAY_FOCUS'} onClick={state.zoomOut}>−</button>
      </div>
    </nav>
    {ready === null && <div className="scene-message"><p>Preparing the workbench</p><span>Loading Nexys 4 DDR…</span></div>}
    <div className="hover-label" role="status">{state.tooltip || (state.transitioning ? 'Moving camera…' : '')}</div>
    <div className="scene-status" aria-live="polite"><i className={state.powered ? 'power-on' : ''} /><span>{!state.powered ? 'POWER OFF' : state.booting ? 'CONFIGURING' : `${state.module.toUpperCase()} / ${content.title}`}</span><span className="sr-only">Seven-segment readout: {readout(state)}</span></div>
    <div className="scene-hint">DRAG TO ORBIT <span>·</span> SCROLL OR +/− TO ZOOM <span>·</span> CLICK A SWITCH OR BUTTON</div>
    <div className="utility-controls"><button aria-pressed={state.reducedMotion} onClick={() => state.setReducedMotion(!state.reducedMotion)}>{state.reducedMotion ? 'Motion off' : 'Motion on'}</button><button aria-expanded={controls} aria-controls="controls-panel" onClick={() => setControls(!controls)}>Controls {controls ? '−' : '+'}</button></div>
    {controls && <aside id="controls-panel" className="controls-panel" aria-label="Board controls">
      <div className="panel-heading"><h2>Physical controls</h2><button aria-label="Close controls" onClick={() => setControls(false)}>×</button></div>
      <p>SW0–6 select one portfolio section. SW7–15 set the input register. Each LED mirrors its switch.</p>
      <div className="accessible-switches">{Array.from({length:16},(_,i) => <button key={i} role="switch" aria-checked={state.switches[i]} onClick={() => state.toggleSwitch(i)}><span>SW{i}</span>{i<modules.length ? modules[i] : `Input ${i}`}<i /></button>)}</div>
      <div className="button-equivalents">
        <button onClick={() => state.press('BTNU')}>↑ Section</button><button onClick={() => state.press('BTND')}>↓ Section</button><button onClick={() => state.press('BTNL')}>← Item</button><button onClick={() => state.press('BTNR')}>Item →</button><button onClick={() => state.press('BTNC')}>Inspect I/O</button><button onClick={() => state.press('CPU_RESET')}>Reset</button><button onClick={() => state.press('PROG')}>Segment test</button><button onClick={state.power}>{state.powered ? 'Power off' : 'Power on'}</button>
      </div>
      <p className="readout-help">Readout: <b>section · item · switch register (hex)</b></p>
      <p className="key-help">1–7 select sections · Arrows navigate · +/− zoom · Enter inspects · R resets · Esc returns</p>
    </aside>}
    <noscript><p className="scene-message">Enable JavaScript to explore the 3D board.</p></noscript>
  </main>;
}
