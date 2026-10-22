# Nexys 4 DDR reconstruction

Primary visual reference: the front photograph supplied in this conversation (1634 × 1504 displayed pixels). `build_nexys_realistic.py` records component placements in that photograph's pixel coordinates. The photograph is not bundled or used as a fake board surface: the script builds real component geometry and draws a separate PCB marking/routing texture. Routing density, via fields, plated contacts, solder, package details, and the personalized markings are procedural approximations.

Secondary factual reference: [Digilent Nexys4 DDR reference manual, revision C](https://digilent.com/reference/_media/nexys4-ddr/nexys4ddr_rm.pdf). Used to confirm the Artix-7 BGA, DDR2 memory, switch/button counts, two four-digit displays, Pmod headers, and connector identities. No additional photographic views were used.

## Rebuild

```sh
python3.11 -m venv .blender-venv
.blender-venv/bin/python -m pip install bpy==4.2.13 Pillow
.blender-venv/bin/python -u modeling/build_oled_module.py
.blender-venv/bin/python -u modeling/build_nexys_realistic.py
.blender-venv/bin/python modeling/validate_glb.py
```

Build the reusable OLED carrier on its own with `build_oled_module.py`; it writes `public/models/oled-module.glb`, `modeling/oled-module.blend`, and the detailed `previews/oled-module.png`. The full board builder uses the same helper geometry to mount an enlarged (125%) version beside JA, with its connector edge aimed toward the FPGA. It writes the board `.blend`, self-contained GLB, node manifest, top and studio renders, and an illuminated segment closeup. The red OLED carrier follows the supplied display-module reference, with four plated mounting holes, a raised bezel and glass, FPC contacts, and individually modeled small components. Its active area remains a separately addressable `OLED_SCREEN` mesh. A compact 30 mm square axial cooling fan sits on the board's left half; its four frame rails, seven swept blades, and central rotor retain separate node names. The website spins the rotor while board power is on and stops it when power is off.

## Control contract

- `SW0_Slider` … `SW15_Slider`: individual movable slider objects; `SW16_Slider` is main power.
- `BTNU_Plunger`, `BTND_Plunger`, `BTNL_Plunger`, `BTNR_Plunger`, `BTNC_Plunger`, `CPU_RESET_Plunger`, `PROG_Plunger`.
- `LED0` … `LED15`: separate user LED diffusers; additional status/RGB diffusers retain their names.
- `Digit0_SegmentA` … `Digit7_SegmentG`, plus `DigitN_SegmentDP`: independently addressable six-sided diffuser bars and decimal points. Digit 7 is leftmost; digit 0 is rightmost.
- Static, noninteractive parts are grouped by material to reduce draw calls. The board is not one merged mesh. Some slider objects contain multiple material primitives under the named transform.
- glTF converts Blender's component-facing +Z into Three.js +Y. Switches move toward negative Three.js Z when ON. Buttons depress along negative Y.

The OLED attaches to JA Pmod over a visual SPI lead. The web scene renders live portfolio text on the OLED surface and focuses the camera on it when clicked.

## Accuracy limits

This is a photograph-based visual reconstruction, not manufacturer mechanical CAD or a validated electrical layout. The silhouette and component positions follow the supplied reference. Thicknesses, unseen connector interiors, underside features, dense routing, and passive details are approximated. Texture traces and OLED wires are visual only, not an electrical netlist. The personalized silkscreen does not claim that the virtual board is an official manufacturer product.

## Editing PCB text in Blender

Open `modeling/nexys4-ddr.blend` and expand the `EDITABLE_SILKSCREEN_TEXT` collection in the Outliner. Select a named `EDIT_*` object, open **Object Data Properties** (the green text icon), and change its **Body** field. These source objects remain Blender `FONT` curves. The build script creates separate `_EXPORT` mesh copies because glTF cannot reliably preserve editable font objects.

After changing text in Blender, duplicate the edited text, convert the duplicate with **Object → Convert → Mesh**, and use that mesh for export. To make the change reproducible on future builds, also update the matching `editable_pcb_text(...)` call in `modeling/build_nexys_realistic.py`. Smaller reference designators and connector labels remain in `modeling/textures/pcb-silkscreen.png`; change their `label(...)` calls in the script and rebuild the model.
