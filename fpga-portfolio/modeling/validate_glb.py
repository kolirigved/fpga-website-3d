"""Validate the exported file's actual node contract and geometry budget."""
import json, struct
from pathlib import Path
root=Path(__file__).resolve().parents[1]
path=root/'public/models/nexys4-ddr.glb'
raw=path.read_bytes()
magic,version,length=struct.unpack_from('<III',raw)
assert magic==0x46546C67 and version==2 and length==len(raw)
json_length,chunk_type=struct.unpack_from('<II',raw,12)
assert chunk_type==0x4E4F534A
gltf=json.loads(raw[20:20+json_length])
manifest=json.loads((path.parent/'nexys4-ddr.manifest.json').read_text())
nodes={n['name']:n for n in gltf['nodes']}
for key in ('switches','buttons','leds','segments'):
    expected=manifest[key]
    assert len(set(expected))==len(expected)
    for name in expected:
        assert name in nodes, f'Missing controllable node: {name}'
        node=nodes[name]
        assert 'mesh' in node or any('mesh' in gltf['nodes'][i] for i in node.get('children',[])), f'Control has no geometry: {name}'
assert manifest['power_switch'] in nodes
assert manifest['oled']['mesh'] in nodes, 'Missing named OLED surface mesh'
for name in [manifest['cooling_fan']['rotor_node'], *manifest['cooling_fan']['frame_nodes'], *manifest['cooling_fan']['blade_nodes']]:
    assert name in nodes, f'Missing cooling-fan component: {name}'
rotor_children={gltf['nodes'][child]['name'] for child in nodes[manifest['cooling_fan']['rotor_node']].get('children',[])}
assert set(manifest['cooling_fan']['blade_nodes']).issubset(rotor_children), 'Fan blades must remain children of the rotating hub'
triangles=0
for m in gltf['meshes']:
    for p in m['primitives']:
        if 'indices' in p: triangles += gltf['accessors'][p['indices']]['count']//3
assert len(raw)<12_000_000, 'Model exceeds 12MB budget'
assert triangles<250_000, 'Model exceeds triangle budget'
report={'file':str(path.relative_to(root)),'bytes':len(raw),'triangles':triangles,'meshes':len(gltf['meshes']),'materials':len(gltf['materials']),'independent_switches':len(manifest['switches']),'independent_buttons':len(manifest['buttons']),'independent_user_leds':len(manifest['leds']),'independent_segments_including_decimal_points':len(manifest['segments']),'oled_screen_mesh':manifest['oled']['mesh'],'oled_scale':manifest['oled']['scale'],'cooling_fan_frame_nodes':len(manifest['cooling_fan']['frame_nodes']),'cooling_fan_blade_nodes':len(manifest['cooling_fan']['blade_nodes']),'embedded_images':len(gltf.get('images',[])),'all_control_names_verified':True}
oled_path=root/'public/models/oled-module.glb'
oled_raw=oled_path.read_bytes();oled_json_length,oled_chunk_type=struct.unpack_from('<II',oled_raw,12)
assert struct.unpack_from('<III',oled_raw)[0:2]==(0x46546C67,2) and struct.unpack_from('<III',oled_raw)[2]==len(oled_raw)
assert oled_chunk_type==0x4E4F534A
oled_gltf=json.loads(oled_raw[20:20+oled_json_length]);oled_nodes={node['name']:node for node in oled_gltf['nodes']}
for name in ('OLED_PCB_red_carrier','OLED_SCREEN','OLED_display_bezel','OLED_FPC_ZIF_socket',*[f'OLED_mount_hole_{i}' for i in (2,4,6,8)]):
    assert name in oled_nodes, f'Missing standalone OLED component: {name}'
report['standalone_oled']={'file':str(oled_path.relative_to(root)),'bytes':len(oled_raw),'separate_mount_holes':4,'screen_node':'OLED_SCREEN','component_nodes':len(oled_nodes)}
(root/'previews/model-validation.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
