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
triangles=0
for m in gltf['meshes']:
    for p in m['primitives']:
        if 'indices' in p: triangles += gltf['accessors'][p['indices']]['count']//3
assert len(raw)<12_000_000, 'Model exceeds 12MB budget'
assert triangles<250_000, 'Model exceeds triangle budget'
report={'file':str(path.relative_to(root)),'bytes':len(raw),'triangles':triangles,'meshes':len(gltf['meshes']),'materials':len(gltf['materials']),'independent_switches':len(manifest['switches']),'independent_buttons':len(manifest['buttons']),'independent_user_leds':len(manifest['leds']),'independent_segments_including_decimal_points':len(manifest['segments']),'embedded_images':len(gltf.get('images',[])),'all_control_names_verified':True}
(root/'previews/model-validation.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
