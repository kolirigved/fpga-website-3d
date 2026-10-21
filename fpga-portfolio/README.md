# Nexys 4 DDR — interactive 3D workbench

A full-viewport, board-only Next.js / React Three Fiber scene for Rigved Koli. The board is a Blender-built recreation of the supplied **Digilent Nexys 4 DDR** photograph. There is no external display, reading modal, scrolling portfolio layout, or separate project page in this phase.

## Run

```sh
cd fpga-portfolio
npm install
npm run dev
```

Open http://localhost:3000. Node.js 20.9+ is required. `npm run build` exports a static site to `out/`.

## Model and previews

- `modeling/nexys4-ddr.blend` — editable Blender source with packed textures.
- `modeling/build_nexys.py` — reproducible bpy generator.
- `public/models/nexys4-ddr.glb` — optimized, self-contained web asset.
- `public/models/nexys4-ddr.manifest.json` — individually named controls.
- `previews/nexys4-ddr-top.png` — reference comparison view.
- `previews/nexys4-ddr-studio.png` — angled product render.
- `previews/nexys4-ddr-display-detail.png` — illuminated eight-digit closeup.
- `previews/model-validation.json` — actual exported geometry/control counts.

See [modeling/README.md](modeling/README.md) for regeneration, source provenance and approximation limits. This is a photograph-based visual model, not manufacturer mechanical CAD. Small markings, routing, connector interiors and unseen underside geometry are approximated.

## Controls

- Drag the board to orbit within constrained angles.
- SW0–SW7 select Projects, Experience, Research, About, Skills, Contact, Lab or Diagnostics. Activating a section turns the previous section's switch off. Toggling the active section off returns Home.
- SW8–SW15 are independent input bits. All 16 user LEDs mirror their switches.
- Up/down buttons change section. Left/right change project, or section outside Projects.
- Center button focuses the camera on the switches and eight-digit display.
- CPU RESET and PROG clear navigation/register state and run a short segment test.
- The physical SW16 power control blanks LEDs/display and disables push-button actions while off.
- The display reads `SS.II.HHHH`: two decimal section digits, two decimal item digits, and the four hexadecimal digits of the 16-switch register. All seven bars and each decimal point are real individually controlled meshes.
- Top view, Inspect I/O and Back to board use eased camera transitions. Returning restores the prior overview pose and keeps selections.
- Keyboard: 1–8 select sections, arrows navigate, Enter inspects, R resets, Escape returns. The compact Controls panel exposes equivalent keyboard/touch controls.

Only compact labels, camera buttons, a hover hint, and an optional controls panel sit outside the 3D scene. Portfolio text remains structured in `src/data/portfolio.ts` for the later display phase. A short status line identifies the current section/project.

## Architecture

- `src/components/scene/Hardware.tsx`: GLB loader, pointer interaction, per-control transforms and materials.
- `src/components/scene/CameraController.tsx`: constrained orbit and named camera transitions.
- `src/components/scene/Scene.tsx`: black environment and studio lighting/reflections.
- `src/state/board.ts`: physical control state, seven-segment encoding and `displayPayload()`.
- `src/components/Portfolio.tsx`: minimal HUD, input shortcuts and reduced-motion preferences.

No external display is instantiated. `attachDisplay()` and `displayPayload()` provide a future attachment interface; `DISPLAY_FOCUS` is guarded until a display supplies its pose/dimensions. JA Pmod is reserved as the intended future serial OLED connection.

## Verify

```sh
npm test
npm run typecheck
npm run build
.blender-venv/bin/python modeling/validate_glb.py
```

With the dev server running and Google Chrome installed:

```sh
node tests/browser.mjs
node tests/hardware.mjs
```

No AI API, backend, paid runtime, downloaded fonts, or remote HDR assets are required. The GLB is served locally. WebGL-unavailable devices receive a clear notice instead of a blank scene.
