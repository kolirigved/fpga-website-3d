"""Reusable, photo-reference-inspired 128x64 OLED carrier module geometry."""
from pathlib import Path
import math
import bpy
from PIL import Image, ImageDraw, ImageFont

MODEL_DIR = Path(__file__).resolve().parent
TEX_DIR = MODEL_DIR / 'textures'
TEX_DIR.mkdir(parents=True, exist_ok=True)


def create_oled_module(center=(0, 0, 0), scale=1.0, facing=0.0, yaw=0.0):
    """Create a red PCB OLED module at center, returning its individual meshes.

    Local module coordinates are centimeters. By default the board lies flat
    and its glass faces Blender +Z / Three.js +Y.
    """
    ox, oy, oz = center
    c = math.cos(facing); s = math.sin(facing)
    cy = math.cos(yaw); sy = math.sin(yaw)
    objects = []

    def position(x, y, z):
        local_y = y * c - z * s
        return (ox + (x * cy - local_y * sy) * scale, oy + (x * sy + local_y * cy) * scale, oz + (y * s + z * c) * scale)

    def mat(name, color, metal=0.0, rough=.5, emission=0.0):
        m = bpy.data.materials.new(name); m.diffuse_color = (*color, 1); m.use_nodes = True
        shader = m.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Base Color'].default_value = (*color, 1)
        shader.inputs['Metallic'].default_value = metal; shader.inputs['Roughness'].default_value = rough
        if emission:
            shader.inputs['Emission Color'].default_value = (*color, 1); shader.inputs['Emission Strength'].default_value = emission
        return m

    pcb = mat('OLED_red_FR4', (.47, .025, .035), .12, .58)
    pcb_edge = mat('OLED_red_PCB_edge', (.24, .014, .022), .05, .72)
    black = mat('OLED_PBT_bezel', (.012, .016, .018), .02, .34)
    glass = mat('OLED_glass', (.0015, .008, .007), .12, .19)
    metal = mat('OLED_tin_plating', (.58, .61, .59), .8, .27)
    gold = mat('OLED_FPC_gold', (.78, .48, .12), .78, .26)
    silk = mat('OLED_silkscreen_ink', (.88, .82, .74), .02, .75)
    chipmat = mat('OLED_controller_epoxy', (.035, .04, .043), .03, .78)
    capmat = mat('OLED_passive_ceramic', (.72, .68, .56), .08, .48)

    def box(name, x, y, z, w, h, d, material, bevel=0.0):
        a, b, t = w * scale / 2, h * scale / 2, d * scale / 2
        verts = [(-a,-b,-t),(a,-b,-t),(a,b,-t),(-a,b,-t),(-a,-b,t),(a,-b,t),(a,b,t),(-a,b,t)]
        faces = [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
        mesh = bpy.data.meshes.new(name); mesh.from_pydata(verts, [], faces); mesh.update(); mesh.materials.append(material)
        obj = bpy.data.objects.new(name, mesh); bpy.context.collection.objects.link(obj); obj.location = position(x,y,z); obj.rotation_euler[0] = facing; obj.rotation_euler[2] = yaw
        if bevel:
            mod = obj.modifiers.new('Molded_corner_radius', 'BEVEL'); mod.width = bevel * scale; mod.segments = 3
            obj.modifiers.new('Weighted_normals', 'WEIGHTED_NORMAL')
        objects.append(obj); return obj

    def plane(name, x, y, z, w, h, material):
        a, b = w * scale / 2, h * scale / 2
        mesh = bpy.data.meshes.new(name); mesh.from_pydata([(-a,-b,0),(a,-b,0),(a,b,0),(-a,b,0)], [], [(0,1,2,3)]); mesh.update(); mesh.materials.append(material)
        obj = bpy.data.objects.new(name, mesh); bpy.context.collection.objects.link(obj); obj.location = position(x,y,z); obj.rotation_euler[0] = facing; obj.rotation_euler[2] = yaw
        uv = mesh.uv_layers.new(name='Surface_uv')
        # glTF's Blender-to-Three axis conversion reverses this plane's
        # apparent reading direction, so counter-rotate its UVs here.
        for index, coord in enumerate(((0,1),(1,1),(1,0),(0,0))): uv.data[index].uv = coord
        objects.append(obj); return obj

    # Red carrier PCB with clipped-looking corner radius, real plated holes,
    # board edge thickness, and individually modeled surface-mount parts.
    board = box('OLED_PCB_red_carrier', 0, 0, 0, 4.55, 2.82, .085, pcb, .10)
    for x in (-1.98, 1.98):
        for y in (-1.10, 1.10):
            # Annulus and dark bore read as a through-hole on the tiny board.
            vertices = 32; verts = []
            for radius in (.145, .092):
                verts.extend([(x + radius*math.cos(math.tau*i/vertices), y + radius*math.sin(math.tau*i/vertices), .047*scale) for i in range(vertices)])
            faces = [(i,(i+1)%vertices,(i+1)%vertices+vertices,i+vertices) for i in range(vertices)]
            mesh = bpy.data.meshes.new(f'OLED_mount_annulus_{len(objects)}'); mesh.from_pydata(verts, [], faces); mesh.update(); mesh.materials.append(metal)
            obj = bpy.data.objects.new(f'OLED_mount_annulus_{len(objects)}', mesh); bpy.context.collection.objects.link(obj); obj.location = position(0,0,0); obj.rotation_euler[0] = facing; obj.rotation_euler[2] = yaw; objects.append(obj)
            verts = [(0,0,0)] + [(.092*scale*math.cos(math.tau*i/32),.092*scale*math.sin(math.tau*i/32),0) for i in range(32)]
            faces = [(0,i+1,(i+1)%32+1) for i in range(32)]
            mesh = bpy.data.meshes.new(f'OLED_mount_hole_{len(objects)}'); mesh.from_pydata(verts, [], faces); mesh.update(); mesh.materials.append(black)
            obj = bpy.data.objects.new(f'OLED_mount_hole_{len(objects)}', mesh); bpy.context.collection.objects.link(obj); obj.location = position(x,y,.048); obj.rotation_euler[0] = facing; obj.rotation_euler[2] = yaw; objects.append(obj)

    # Front bezel and glossy dark glass. The screen is a separate named plane
    # so the portfolio can be rendered dynamically by the website.
    box('OLED_display_package', 0, .02, .13, 3.72, 2.26, .18, black, .13)
    box('OLED_display_bezel', 0, .02, .229, 3.55, 2.08, .045, metal, .10)
    box('OLED_inner_mask', 0, .02, .255, 3.38, 1.91, .035, black, .08)

    preview_path = TEX_DIR / 'oled-screen-preview.png'
    img = Image.new('RGB', (1024, 580), (2, 8, 7)); draw = ImageDraw.Draw(img)
    font_path = '/System/Library/Fonts/Menlo.ttc'
    try: font = ImageFont.truetype(font_path, 38); small = ImageFont.truetype(font_path, 27)
    except OSError: font = ImageFont.load_default(); small = font
    draw.rectangle((18,18,1006,562), outline=(24,92,66), width=4)
    draw.text((46,54), 'RIGVED KOLI  /  FPGA', font=small, fill=(79,239,163))
    draw.line((46,102,976,102), fill=(28,104,70), width=3)
    draw.text((46,150), 'FPGA PORTFOLIO', font=font, fill=(183,255,215))
    draw.text((46,244), 'ELECTRICAL ENGINEERING', font=small, fill=(99,208,151))
    draw.text((46,304), 'IIT KANPUR  ·  REV 01', font=small, fill=(99,208,151))
    draw.text((46,468), 'JA / SPI  ·  SYSTEM READY', font=small, fill=(72,171,119))
    img.save(preview_path)
    screen_material = mat('OLED_active_screen', (.0015,.008,.007), .12, .19)
    texture = bpy.data.images.load(str(preview_path), check_existing=True)
    texture_node = screen_material.node_tree.nodes.new('ShaderNodeTexImage'); texture_node.image = texture
    bsdf = screen_material.node_tree.nodes.get('Principled BSDF')
    screen_material.node_tree.links.new(texture_node.outputs['Color'], bsdf.inputs['Base Color'])
    screen_material.node_tree.links.new(texture_node.outputs['Color'], bsdf.inputs['Emission Color'])
    bsdf.inputs['Emission Strength'].default_value = .9
    screen = plane('OLED_SCREEN', 0, .02, .277, 3.27, 1.80, screen_material)
    screen['interface'] = 'JA Pmod SPI'; screen['display'] = 'portfolio'

    # FPC/ZIF tail along the display's left edge. In the full scene this edge
    # faces the FPGA so the connection reads like a short direct run.
    box('OLED_FPC_ZIF_socket', -1.90, .02, .12, .28, 2.42, .14, black, .035)
    box('OLED_FPC_latch', -1.90, .02, .205, .105, 2.34, .04, metal, .015)
    for i in range(24):
        y = -1.05 + i * .091
        box(f'OLED_FPC_contact_{i:02d}', -2.12, y, .09, .23, .034, .012, gold)

    # Visible controller, passives, and silk labels make the red carrier read
    # like the reference's populated display module rather than a bare panel.
    box('OLED_controller_IC', 1.88, -.27, .052, .30, .34, .07, chipmat, .035)
    for i in range(6): box(f'OLED_controller_pin_{i:02d}', 1.72+i*.064, -.47, .049, .04,.08,.012,metal)
    for i in range(5): box(f'OLED_MLCC_{i:02d}', 1.91, .28+i*.13, .054, .13,.07,.04,capmat,.012)
    for i in range(4): box(f'OLED_test_pad_{i:02d}', -1.55+i*.28, -1.24, .051, .13,.09,.018,gold,.01)

    # Small molded-style board legends are converted to meshes for glTF.
    def text_mesh(name, text, x, y, z, size):
        curve = bpy.data.curves.new(name, 'FONT'); curve.body = text; curve.size = size*scale; curve.extrude = .001*scale; curve.align_x = 'CENTER'
        obj = bpy.data.objects.new(name, curve); bpy.context.collection.objects.link(obj); obj.location = position(x,y,z); obj.rotation_euler[0] = facing; obj.rotation_euler[2] = yaw; obj.data.materials.append(silk)
        bpy.ops.object.select_all(action='DESELECT'); obj.select_set(True); bpy.context.view_layer.objects.active = obj; bpy.ops.object.convert(target='MESH')
        obj = bpy.context.object; objects.append(obj); return obj
    text_mesh('OLED_silkscreen_model', 'OLED 128x64', .98, 1.20, .05, .125)
    text_mesh('OLED_silkscreen_pin_names', 'VCC · GND · SCL · SDA', .48, 1.22, .05, .105)
    text_mesh('OLED_silkscreen_interface', 'I2C / SPI', 1.87, -.78, .05, .09)
    return objects
