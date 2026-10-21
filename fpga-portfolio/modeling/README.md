# Nexys 4 DDR reconstruction

Primary visual reference: the front photograph supplied in this conversation (1634 × 1504 displayed pixels). `build_nexys.py` records component placements in that photograph's pixel coordinates. The photograph is not bundled or used as a fake board surface: the script builds real component geometry and draws a separate PCB marking/routing texture.

Secondary factual reference: [Digilent Nexys4 DDR reference manual, revision C](https://digilent.com/reference/_media/nexys4-ddr/nexys4ddr_rm.pdf). Used to confirm the Artix-7 BGA, DDR2 memory, switch/button counts, two four-digit displays, Pmod headers, and connector identities. No additional photographic views were used.

## Rebuild

```sh
python3.11 -m venv .blender-venv
.blender-venv/bin/python -m pip install bpy==4.2.13 Pillow
.blender-venv/bin/python -u modeling/build_nexys.py
.blender-venv/bin/python modeling/validate_glb.py
```

This runs Blender's official Python module without requiring the Blender GUI. It saves a `.blend` with packed textures, a self-contained GLB, a node manifest, a top render, a studio render, and an illuminated segment closeup. The script currently uses macOS Arial font paths; change `fontfile` and `boldfile` for another operating system.

## Control contract

- `SW0_Slider` … `SW15_Slider`: individual movable slider objects; `SW16_Slider` is main power.
- `BTNU_Plunger`, `BTND_Plunger`, `BTNL_Plunger`, `BTNR_Plunger`, `BTNC_Plunger`, `CPU_RESET_Plunger`, `PROG_Plunger`.
- `LED0` … `LED15`: separate user LED diffusers; additional status/RGB diffusers retain their names.
- `Digit0_SegmentA` … `Digit7_SegmentG`, plus `DigitN_SegmentDP`: independently addressable six-sided diffuser bars and decimal points. Digit 7 is leftmost; digit 0 is rightmost.
- Static, noninteractive parts are grouped by material to reduce draw calls. The board is not one merged mesh. Some slider objects contain multiple material primitives under the named transform.
- glTF converts Blender's component-facing +Z into Three.js +Y. Switches move toward negative Three.js Z when ON. Buttons depress along negative Y.

The manifest reserves JA Pmod as a future serial display attachment point. No external display geometry is included.

## Accuracy limits

This is a photograph-based visual reconstruction, not manufacturer mechanical CAD or a validated electrical layout. The silhouette, front component positions, markings, and proportions follow the supplied reference. Thicknesses, unseen connector interiors, underside features, and small routing/passive details are approximated. Texture traces are visual reference-style routing, not an electrical netlist. Digilent/Xilinx markings identify the reproduced product; this is not an official model.
