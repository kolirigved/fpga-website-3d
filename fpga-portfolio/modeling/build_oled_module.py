"""Build the standalone red-PCB OLED module shown beside the FPGA board.

Run: .blender-venv/bin/python -u modeling/build_oled_module.py
The display surface is independently named OLED_SCREEN for live replacement.
"""
from pathlib import Path
import bpy
from mathutils import Vector
from oled_module import create_oled_module

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public/models/oled-module.glb'
PREVIEW = ROOT / 'previews/oled-module.png'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
PREVIEW.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
parts = create_oled_module(scale=1.65)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'; scene.cycles.samples = 16; scene.cycles.use_denoising = True
scene.render.resolution_x = 1200; scene.render.resolution_y = 850; scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'
scene.world.use_nodes = True; scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.012,.012,.014,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .35
for name, location, energy, size in [('Key',(-4,-5,7),850,5),('Fill',(5,-3,4),500,4),('Edge',(1,4,5),600,3)]:
    data=bpy.data.lights.new(name,'AREA'); data.energy=energy; data.shape='DISK'; data.size=size
    obj=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(obj); obj.location=location
    obj.rotation_euler=(-obj.location).to_track_quat('-Z','Y').to_euler()
camdata=bpy.data.cameras.new('OLED_preview_camera'); camera=bpy.data.objects.new('OLED_preview_camera',camdata)
bpy.context.collection.objects.link(camera); scene.camera=camera; camera.location=(1.0,-7,2.4)
camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler(); camdata.type='ORTHO'; camdata.ortho_scale=8.0
meshes=[o for o in scene.objects if o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
for obj in meshes: obj.select_set(True)
bpy.context.view_layer.objects.active=next(o for o in meshes if o.name=='OLED_SCREEN')
bpy.ops.export_scene.gltf(filepath=str(OUTPUT),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_yup=True,export_cameras=False,export_lights=False)
scene.render.image_settings.file_format='PNG'; scene.render.filepath=str(PREVIEW)
bpy.ops.render.render(write_still=True)
for image in bpy.data.images:
    if image.source=='FILE': image.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'modeling/oled-module.blend'))
print(f'OLED_MODULE_COMPLETE {OUTPUT} ({OUTPUT.stat().st_size} bytes)',flush=True)
import os, sys
sys.stdout.flush(); sys.stderr.flush(); os._exit(0)
