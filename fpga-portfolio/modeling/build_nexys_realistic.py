"""Personalized Nexys 4 DDR model with a connected OLED portfolio display.

Run: .blender-venv/bin/python modeling/build_nexys_realistic.py
Board coordinates are sampled from the supplied 1634 x 1504 reference.
One model unit represents one centimeter (nominal photograph-derived dimensions).
Blender +Z is the component side; glTF exports this as +Y. No external assets needed.
"""
from pathlib import Path
import math, json, random, time
import bpy
from mathutils import Vector
from PIL import Image, ImageDraw, ImageFont
from oled_module import create_oled_module

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/models'
PREVIEWS = ROOT / 'previews'
TEX = ROOT / 'modeling/textures'
for folder in (ASSETS, PREVIEWS, TEX): folder.mkdir(parents=True, exist_ok=True)
random.seed(4)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.materials, bpy.data.images):
    for block in list(datablocks): datablocks.remove(block)

S = 12.2 / (1555 - 82)
def xy(px, py): return ((px - 818.5) * S, (802.5 - py) * S)
def dims(w, h): return w * S, h * S
STATIC = []
INTERACTIVE = []
def material(name, color, metal=0, rough=.5, emission=0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    if emission:
        p.inputs['Emission Color'].default_value = (*color, 1)
        p.inputs['Emission Strength'].default_value = emission
    return m
pcbmat = material('Solder_mask_deep_teal', (.012,.095,.077), .15, .72)
edge = material('FR4_edge', (.11,.19,.12), 0, .85)
plastic = material('Connector_black_PBT', (.018,.023,.027), .05, .42)
icmat = material('Matte_IC_epoxy', (.038,.045,.047), .03, .87)
metal = material('Nickel_connector_shell', (.53,.57,.59), .82, .29)
solder = material('Tin_solder', (.48,.51,.48), .78, .38)
gold = material('Gold_contacts', (.61,.43,.13), .78, .28)
ceramic = material('MLCC_ceramic', (.43,.39,.29), .05, .76)
resistor_mat = material('Thick_film_resistor', (.075,.061,.046), .02, .72)
ferrite_mat = material('Ferrite_inductor', (.055,.065,.06), .08, .54)
blue = material('Jumper_blue', (.018,.09,.39), .05, .47)
red = material('Reset_red_rubber', (.34,.035,.021), 0, .64)
lens = material('Seven_segment_diffuser_off', (.16,.18,.16), .05, .5)
redlit = material('Seven_segment_red_on', (.8,.028,.008), .05, .45, 2)
ledoff = material('LED_diffuser', (.21,.25,.12), .1, .35)
ledlit = material('LED_green_on', (.15,.65,.04), .05, .3, 1.5)
white = material('Silkscreen_ink', (.73,.79,.72), 0, .85)

def mesh_obj(name, verts, faces, mat, interactive=False):
    mesh = bpy.data.meshes.new(name); mesh.from_pydata(verts, [], faces); mesh.update()
    obj = bpy.data.objects.new(name, mesh); bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    (INTERACTIVE if interactive else STATIC).append(obj)
    return obj

def box(name, px, py, w, h, height, base=.16, mat=plastic, interactive=False, bevel=0):
    x,y = xy(px,py); a,b = dims(w,h); a/=2; b/=2; c=height/2
    verts=[(-a,-b,-c),(a,-b,-c),(a,b,-c),(-a,b,-c),(-a,-b,c),(a,-b,c),(a,b,c),(-a,b,c)]
    obj=mesh_obj(name,verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat,interactive)
    obj.location=(x,y,base+c)
    if bevel:
        mod=obj.modifiers.new('Manufactured_edge_radius','BEVEL');mod.width=bevel;mod.segments=2
        mod=obj.modifiers.new('Weighted_normals','WEIGHTED_NORMAL')
    return obj

def cylinder(name, px, py, radius, depth, base=.16, mat=metal, vertices=16, interactive=False):
    x,y=xy(px,py); verts=[]
    for z in (-depth/2,depth/2):
        for i in range(vertices):
            t=math.tau*i/vertices; verts.append((radius*math.cos(t),radius*math.sin(t),z))
    faces=[tuple(range(vertices-1,-1,-1)),tuple(range(vertices,vertices*2))]
    faces += [(i,(i+1)%vertices,(i+1)%vertices+vertices,i+vertices) for i in range(vertices)]
    obj=mesh_obj(name,verts,faces,mat,interactive);obj.location=(x,y,base+depth/2)
    return obj

def ring(name,px,py,outer,inner,z,mat=gold,n=20):
    x,y=xy(px,py);verts=[]
    for radius in (outer,inner):
        verts += [(x+radius*math.cos(math.tau*i/n),y+radius*math.sin(math.tau*i/n),z) for i in range(n)]
    return mesh_obj(name,verts,[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],mat)

# Draw our own flat silkscreen/copper atlas. Only markings/layout come from the reference.
W,H=3072,2744; image=Image.new('RGB',(W,H),(8,63,58)); draw=ImageDraw.Draw(image)
def uv(px,py): return ((px-82)/(1555-82)*W,(py-145)/(1460-145)*H)
fontfile='/System/Library/Fonts/Supplemental/Arial.ttf'
boldfile='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
def label(text,px,py,size=15,color=(212,227,217),bold=False,anchor='mm'):
    draw.text(uv(px,py),text,font=ImageFont.truetype(boldfile if bold else fontfile,int(size*W/1473)),fill=color,anchor=anchor,spacing=1)
def line(points,color=(16,88,77),width=1): draw.line([uv(*p) for p in points],fill=color,width=max(1,int(width*W/1473)))
def outline(px,py,w,h):
    a=uv(px-w/2,py-h/2);b=uv(px+w/2,py+h/2);draw.rectangle([a,b],outline=(151,187,163),width=2)

# Multi-layer-looking copper fanouts, via fields and crowded signal corridors.
# They are a visual reconstruction, not an electrical netlist.
for i in range(20):
    line([(725+i*6,735),(635+i*6,615),(390+i*9,615),(290+i*9,520)],width=1.1)
    line([(900,755+i*6),(985+i*4,670+i*6),(1280+i*4,670+i*6),(1415,560+i*7)],width=1)
for i in range(12):
    line([(770+i*8,888),(660+i*6,960),(660+i*6,1050),(380+i*12,1180)],width=1)
    line([(922,820+i*4),(1080+i*5,900+i*4),(1370,900+i*4)],width=1)
for i in range(7): line([(900,730+i*8),(1045,550+i*8),(1315,550+i*8),(1440,450+i*8)],width=2)
for i in range(14):
    line([(716+i*7,748),(604+i*8,702),(474+i*7,702),(421+i*6,652)],(15,103,91),1)
    line([(918+i*5,879),(1000+i*8,936),(1114+i*8,936),(1180+i*7,1010)],(14,97,88),1)
    line([(691+i*8,1038),(626+i*8,1110),(523+i*10,1110),(465+i*8,1198)],(15,94,83),1)
for i in range(11):
    x=1044+i*32
    line([(x,566),(x+10,593),(x+32,604),(x+48,632)],(17,106,92),1)
for i in range(9):
    y=706+i*19
    line([(1047,y),(1112,y+8),(1165,y+8),(1214,y+35)],(13,94,84),1)
for i in range(740):
    px=random.uniform(145,1475);py=random.uniform(300,1270)
    if 675<px<1000 and 690<py<1080: continue
    u,v=uv(px,py);r=random.choice((1,2,2,3));draw.ellipse((u-r,v-r,u+r,v+r),outline=random.choice(((35,113,91),(43,123,98),(25,91,80))),width=1)
for i in range(16):
    px=220+i*80
    label(str(15-i),px,1248,14,bold=True)
    label(f'LD{15-i}',px,1272,9);label(f'SW{15-i}',px,1290,10)
    outline(px,1378,75,156)
label('RIGVED KOLI',810,530,39,bold=True);label('FPGA WORKBENCH',810,574,21,bold=True)
label('ELECTRICAL ENGINEERING',1247,734,19,bold=True);label('DIGITAL SYSTEMS / REV 01',1237,769,14,bold=True)
label('PERSONAL HARDWARE LAB',1290,792,13,bold=True)
for text,x,y,size in [('USB HOST',530,350,18),('ETHERNET',803,425,20),('VGA',1250,341,20),('MONO',1416,314,18),('AUDIO OUT',1417,338,18),('POWER',342,329,17),('ON',408,188,17),('OFF',411,295,17),('USB  WALL',174,338,17),('5V ONLY',292,374,17),('PROG',117,539,15),('UART',117,562,15),('SD',111,611,17),('MICRO',123,638,17),('CPU RESET',1119,682,17),('PROG',1338,679,17),('DONE',1012,655,17),('JXADC',1456,625,15),('JA',1454,914,15),('JB',1456,1193,15),('JD',183,915,15),('JC',180,1191,15),('MIC',261,984,16),('BUSY',551,478,16),('MODE',1291,479,18),('QSPI   JTAG   USB/SD',1190,531,11),('TEMP',1486,1279,17),('SENSOR',1490,1307,16),('TMS TDI TDO TCK GND 3V3',1260,1192,11),('IC8',812,909,12),('IC16',813,1067,12),('BTNU (M18)',1228,887,14),('BTNL',1115,1021,14),('BTNC (N17)',1227,997,14),('BTNR',1339,1021,14),('BTND (P18)',1234,1109,14)]: label(text,x,y,size,bold=True)
for px,py in [(505,735),(505,911),(505,1010)]:
    label('GND',px-38,py,12);label('VCC3V3',px-50,py+27,12)
for j,text in enumerate(['MCLR','3V3','GND','PGD','PGC']): label(text,478,348+j*30,15)
for x,y in [(1460,456),(1460,745),(1460,1030),(172,745),(172,1030)]:
    label('3V3',x-35 if x>800 else x+60,y+138,13);label('GND',x-35 if x>800 else x+60,y+110,13)
for x,y,w,h in [(814,806,192,188),(816,1005,164,112),(1231,847,66,64),(1120,954,66,64),(1228,954,66,64),(1337,954,66,64),(1230,1065,66,64),(1116,642,66,62),(1337,642,66,62)]: outline(x,y,w+9,h+9)
for i in range(32): label(f'C{130+i}',626+(i%4)*23,656+(i//4)*20,8)
for i in range(20): label(f'R{200+i}',931+(i%5)*20,653+(i//5)*19,8)
texture_path=TEX/'pcb-silkscreen.png';image.save(texture_path)
pcbmat.use_nodes=True;p=pcbmat.node_tree.nodes.get('Principled BSDF');tex=pcbmat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(texture_path));pcbmat.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])

pcb=box('PCB_Nexys4_DDR',818.5,802.5,1473,1315,.16,0,pcbmat)
for px,py in [(123,195),(1507,181),(130,1418),(1510,1415)]:
    cutter=cylinder('hole_cutter',px,py,.17,.7,-.2,vertices=24)
    bpy.context.view_layer.objects.active=pcb
    mod=pcb.modifiers.new('Mounting_hole','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
    bpy.ops.object.modifier_apply(modifier=mod.name)
    STATIC.remove(cutter);bpy.data.objects.remove(cutter,do_unlink=True)
    ring('Mounting_annulus',px,py,.205,.173,.162,white)
mesh=pcb.data;uvs=mesh.uv_layers.new(name='Board_layout')
for polygon in mesh.polygons:
    for li in polygon.loop_indices:
        co=mesh.vertices[mesh.loops[li].vertex_index].co
        uvs.data[li].uv=(co.x/12.2+.5,co.y/(1315*S)+.5)

def top_text(name,lines,px,py,w,h,base,bg=(25,29,30),ink=(130,140,132),font_size=39):
    img=Image.new('RGB',(512,512),bg);d=ImageDraw.Draw(img)
    for index,text in enumerate(lines): d.text((32,34+index*62),text,font=ImageFont.truetype(fontfile,font_size if index==1 else max(16,font_size-12)),fill=ink)
    path=TEX/f'{name}.png';img.save(path)
    m=material(name+'_laser_mark',(.1,.1,.1),0,.88);t=m.node_tree.nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(path));m.node_tree.links.new(t.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    x,y=xy(px,py);a,b=dims(w,h)
    obj=mesh_obj(name,[(-a/2,-b/2,0),(a/2,-b/2,0),(a/2,b/2,0),(-a/2,b/2,0)],[(0,1,2,3)],m);obj.location=(x,y,base)
    uv=obj.data.uv_layers.new()
    for i,co in enumerate([(0,0),(1,0),(1,1),(0,1)]): uv.data[i].uv=co

# FPGA is a BGA: no invented gull-wing pins around the package.
box('Artix7_BGA_substrate',815,806,183,185,.045,.17,plastic)
box('Artix7_XC7A100T',815,806,181,181,.13,.215,icmat)
top_text('Artix7_marking',['RIGVED KOLI','FPGA / DIGITAL SYSTEMS','XC7A100T','CSG324','PERSONAL LAB','REV 01'],815,806,176,176,.346,font_size=30)
box('DDR2_128MiB',816,1005,150,103,.1,.18,icmat)
top_text('DDR2_marking',['DDR2 MEMORY','128 MiB','MT47H64M16','PERSONAL LAB'],816,1005,146,99,.281,font_size=32)

def passive(px,py,orient=0):
    w,h=(15,7) if orient==0 else (7,15)
    box('Passive_ceramic',px,py,w,h,.048,.165,ceramic)
    for sign in (-1,1): box('Passive_terminal',px+sign*(w/2-1.7) if not orient else px,py if not orient else py+sign*(h/2-1.7),3.4 if not orient else w,h if not orient else 3.4,.055,.163,solder)

def resistor(px, py, orient=0):
    w,h=(17,6) if orient==0 else (6,17)
    box('Thick_film_resistor',px,py,w,h,.035,.165,resistor_mat)
    for sign in (-1,1):
        box('Resistor_terminal',px+sign*(w/2-1.5) if not orient else px,py if not orient else py+sign*(h/2-1.5),3 if not orient else w,h if not orient else 3,.045,.163,solder)

def ferrite_inductor(name, px, py, w=34, h=30):
    box(name,px,py,w,h,.13,.16,ferrite_mat,.025)
    for dx in (-w/2+5,w/2-5): box(name+'_pad',px+dx,py,7,h-8,.03,.16,solder)

# Populate photographed decoupling banks and regulator islands, not random blocks.
for row in range(4):
    for col in range(10): passive(699+col*29,650+row*18,1 if col>4 else 0)
for side in (-1,1):
    for row in range(5):
        for col in range(3): passive(815+side*(114+col*19),757+row*23,1)
for row in range(6): passive(680,950+row*20);passive(920,950+row*20)
for row in range(7):
    for col in range(3): passive(250+col*32,450+row*22,1 if col==2 else 0)
for px,py in [(560,400),(643,309),(1034,952),(1078,922),(1405,1209),(1500,1224),(230,542),(179,595),(231,595),(334,353),(356,353),(546,496)]: passive(px,py)
for name,x,y,w,h in [('USB_controller',278,508,32,46),('Ethernet_PHY',645,305,30,46),('SPI_flash',328,588,29,61),('Temperature_sensor',1488,1229,39,49),('Accelerometer',983,956,32,26)]: box(name,x,y,w,h,.085,.16,icmat)
box('Clock_oscillator',233,521,39,31,.12,.16,metal)
cylinder('MEMS_microphone',262,951,.092,.08,.16,gold)
cylinder('Microphone_port',262,951,.024,.005,.241,plastic)

# Dense but purposeful support circuitry: switching regulators, termination
# arrays, clock filtering and test access make the personalised board read as
# a populated engineering prototype without obscuring the physical controls.
for i in range(8):
    resistor(469 + i*21, 464, 1)
    resistor(469 + i*21, 534, 1)
for i in range(6):
    resistor(1040 + i*19, 492)
    passive(1040 + i*19, 521, 1)
for px,py in [(436,420),(499,420),(562,420),(436,575),(499,575),(562,575)]: passive(px,py,1)
for name,px,py in [('VCCINT_Regulator',500,497),('VCCAUX_Regulator',1088,550),('VCCO_Regulator',1350,578)]:
    box(name,px,py,54,46,.11,.16,icmat,.018)
    for row in (-1,1):
        for col in range(4): box(name+'_lead',px-21+col*14,py+row*27,7,5,.035,.16,solder)
ferrite_inductor('VCCINT_Ferrite',428,498,38,34)
ferrite_inductor('VCCAUX_Ferrite',1016,550,32,28)
ferrite_inductor('VCCO_Ferrite',1274,578,32,28)
for x,y in [(407,470),(407,494),(407,518),(592,470),(592,494),(592,518),(997,520),(997,544),(997,568),(1179,538),(1179,562),(1179,586),(1305,545),(1305,569),(1305,593)]: passive(x,y)
for x,y in [(670,561),(690,561),(710,561),(930,561),(950,561),(970,561),(710,1080),(730,1080),(750,1080),(870,1080),(890,1080),(910,1080)]: resistor(x,y)
box('QSPI_flash_aux',1204,484,46,36,.08,.16,icmat,.015)
for side in (-1,1):
    for pin in range(4): box('QSPI_aux_pin',1204+side*28,484-12+pin*8,6,4,.03,.16,solder)
box('Clock_filter',1010,428,46,24,.085,.16,metal,.01)
for i in range(6): passive(960+i*20,428,1)
for group_x,group_y in [(635,620),(980,620),(650,1110),(970,1110)]:
    for row in range(4):
        for col in range(4): ring('Signal_via',group_x+col*11,group_y+row*11,.026,.013,.164,gold,12)
for i in range(10):
    ring('Debug_test_pad',725+i*22,1170,.052,.027,.166,gold,16)

# Sixteen independent slide switches, labeled SW15 at left through SW0 at right.
for column in range(16):
    n=15-column;x=220+column*80;y=1378
    box(f'SW{n}_metal_frame',x,y,73,148,.045,.16,metal)
    box(f'SW{n}_housing',x,y,64,137,.19,.205,plastic)
    box(f'SW{n}_slot',x,y,40,100,.015,.397,icmat)
    cap=box(f'SW{n}_Slider',x,y+23,39,58,.14,.413,plastic,True,.026)
    cap['control']='switch';cap['index']=n;cap['travel']=46*S
    # Ridges share the moving cap, rather than staying behind when actuated.
    for ridge in (-10,0,10):
        r=box('Slider_grip',x,y+23+ridge,32,2,.014,.554,icmat)
        bpy.context.view_layer.update()
        r.parent=cap;r.matrix_parent_inverse=cap.matrix_world.inverted()
    box(f'LD{n}_solder',x,1245,25,11,.025,.16,solder)
    led=box(f'LED{n}',x,1245,16,9,.035,.185,ledoff,True,.006)
    led['control']='led';led['index']=n

# Each tactile control consists of a stamped metal base and a separate moving plunger.
buttons=[('BTNU',1230,847,False),('BTNL',1120,954,False),('BTNC',1228,954,False),('BTNR',1337,954,False),('BTND',1230,1065,False),('CPU_RESET',1117,642,True),('PROG',1337,642,True)]
for name,x,y,isred in buttons:
    for sign in (-1,1):
        for dy in (-18,18): box(name+'_solder_leg',x+sign*37,y+dy,17,10,.06,.16,solder)
    box(name+'_body',x,y,58,58,.13,.16,plastic)
    box(name+'_metal_plate',x,y,54,54,.025,.29,metal)
    cylinder(name+'_collar',x,y,.174,.027,.316,icmat,24)
    b=cylinder(name+'_Plunger',x,y,.132,.09,.337,red if isred else plastic,24,True)
    b['control']='button';b['button']=name;b['travel']=.055
    for dx in (-21,21):
        for dy in (-21,21): cylinder('Button_rivet',x+dx,y+dy,.018,.01,.318,solder,8)

# Two real four-digit packages, each with 7 chamfered diffuser bars + decimal per digit.
for pack,px in enumerate((527,929)):
    box(f'DISPLAY{pack}_package',px,1168,397,127,.27,.16,plastic)
    box(f'DISPLAY{pack}_face',px,1168,387,119,.009,.431,icmat)
    for pin in range(12): box('Display_pin',px-173+pin*31,1233,5,13,.05,.18,solder)

def segment(name,cx,cy,length,thick,horizontal):
    # Six-sided bars and a 10 degree italic skew match the molded display apertures.
    L=length/2;T=thick/2
    points=[(-L+T,-T),(L-T,-T),(L,0),(L-T,T),(-L+T,T),(-L,0)]
    if not horizontal: points=[(b,a) for a,b in points]
    points=[(a-b*.16,b) for a,b in points]
    verts=[]
    for z in (0,.009):
        verts.extend([(a*S,-b*S,z) for a,b in points])
    faces=[(5,4,3,2,1,0),(6,7,8,9,10,11)]+[(i,(i+1)%6,(i+1)%6+6,i+6) for i in range(6)]
    o=mesh_obj(name,verts,faces,lens,True);x,y=xy(cx,cy);o.location=(x,y,.442);return o

for col in range(8):
    digit=7-col;cx=377+col*100+(4 if col>=4 else 0);cy=1168
    positions=[('A',7,-43,44,8,True),('B',30,-22,35,8,False),('C',23,23,35,8,False),('D',-7,44,44,8,True),('E',-30,23,35,8,False),('F',-23,-22,35,8,False),('G',0,0,44,8,True)]
    for key,dx,dy,L,T,horiz in positions:
        o=segment(f'Digit{digit}_Segment{key}',cx+dx,cy+dy,L,T,horiz);o['control']='segment';o['digit']=digit;o['segment']=key
    dot=cylinder(f'Digit{digit}_SegmentDP',cx+38,cy+45,.031,.01,.442,lens,12,True);dot['control']='segment';dot['digit']=digit;dot['segment']='DP'

# Right-angle female Pmod headers, with visible plated contacts and separate cavities.
for name,x,y,side in [('JD',91,809,-1),('JC',91,1087,-1),('JXADC',1533,519,1),('JA',1533,801,1),('JB',1533,1083,1)]:
    box(name+'_socket',x,y,101,182,.53,.16,plastic)
    for row in range(6):
        yy=y-76+row*30
        for tier in range(2):
            box('Socket_opening',x+side*51,yy,1.5,17,.14,.24+tier*.20,icmat)
            box('Header_gold_contact',x-side*62,yy,43,4,.027,.20+tier*.16,gold)
        ring('Pmod_plated_pad',x-side*66,yy,.058,.033,.162)

# Back-edge USB host, RJ45, VGA D-sub, barrel jack, audio socket and power switch.
box('USB_host_shell',526,221,163,179,.86,.16,metal)
box('USB_host_mouth',526,130,142,3,.61,.29,plastic)
box('USB_host_tongue',526,122,104,13,.12,.39,plastic)
for i in range(4): box('USB_gold',494+i*21,121,9,15,.012,.515,gold)
for x in (485,565): box('USB_retention',x,190,17,63,.018,1.025,metal)
box('RJ45_shield',802,253,194,258,1.2,.16,metal)
box('RJ45_opening',802,122,157,4,.88,.29,plastic)
box('RJ45_latch_recess',802,120,65,7,.21,.24,icmat)
for i in range(8): box('Ethernet_contact',750+i*15,117,3,13,.25,.72,gold)
for x in (722,878): box('Ethernet_LED_lens',x,119,17,6,.07,1.12,ledoff)
box('VGA_body',1135,211,374,204,.8,.16,plastic)
box('VGA_front_flange',1135,106,376,16,.16,.65,metal)
box('VGA_Dsub_shield',1135,77,208,62,.6,.40,metal)
box('VGA_blue_insert',1135,44,187,4,.46,.46,blue)
for row in range(3):
    for col in range(5):
        # Hole impressions on the front of the connector are oriented outward.
        o=cylinder('VGA_pin_socket',1071+col*30+row*4,40,.032,.012,0,plastic,10)
        o.rotation_euler[0]=math.pi/2;o.location.z=.54+row*.13
for x in (978,1286):
    box('VGA_side_support',x,195,48,121,.07,.16,metal)
    nut=cylinder('VGA_hex_nut',x,85,.17,.43,.34,metal,6);nut.rotation_euler[0]=math.pi/2
    cylinder('VGA_board_bolt',x,231,.064,.12,.24,metal,12)
box('Power_barrel_base',218,226,112,186,.67,.16,plastic)
jack=cylinder('Power_barrel',218,171,.35,.9,.22,plastic,32);jack.rotation_euler[0]=math.pi/2
mouth=cylinder('Power_socket',218,115,.25,.012,0,icmat,24);mouth.rotation_euler[0]=math.pi/2;mouth.location.z=.67
pin=cylinder('Power_center_pin',218,111,.065,.05,0,metal,16);pin.rotation_euler[0]=math.pi/2;pin.location.z=.67
box('SW16_Power_frame',340,234,73,145,.1,.16,metal)
box('SW16_Power_body',340,234,64,135,.23,.26,plastic)
p=box('SW16_Slider',340,213,44,54,.18,.49,plastic,True,.02);p['control']='power';p['travel']=40*S
box('Audio_jack',1415,206,99,144,.66,.16,plastic)
audio=cylinder('Audio_barrel',1415,125,.32,.28,.22,plastic,24);audio.rotation_euler[0]=math.pi/2;audio.location.z=.5
audio=cylinder('Audio_socket',1415,106,.16,.013,0,icmat,24);audio.rotation_euler[0]=math.pi/2;audio.location.z=.5
box('Micro_USB_JTAG',103,475,70,87,.23,.16,metal)
box('Micro_USB_opening',65,475,3,63,.14,.205,plastic)
box('MicroSD_underside',134,651,94,114,.13,-.13,metal)

# Reference-style red OLED carrier. Its enlarged footprint spans the two
# adjacent right-edge Pmod positions (JA and JB), while retaining only the
# four interface contacts the OLED needs. Keep the glass independently named.
oled_scale = 1.65
ja_x, ja_y = xy(1533, 801)
jb_x, jb_y = xy(1533, 1083)
oled_x, oled_y, oled_z = ja_x + 2.24 * oled_scale, (ja_y + jb_y) / 2, .22
oled_yaw = 0  # horizontal screen; its left-side FPC connector faces the FPGA
oled_parts=create_oled_module(center=(oled_x,oled_y,oled_z),scale=oled_scale,facing=0,yaw=oled_yaw)
screen=next(obj for obj in oled_parts if obj.name=='OLED_SCREEN')
for part in oled_parts:
    (INTERACTIVE if part is screen else STATIC).append(part)
def oled_wire(name,points,mat):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.resolution_u=12;data.bevel_depth=.018;data.bevel_resolution=3
    spline=data.splines.new('BEZIER');spline.bezier_points.add(len(points)-1)
    for point,co in zip(spline.bezier_points,points):point.co=co;point.handle_left_type='AUTO';point.handle_right_type='AUTO'
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);obj.data.materials.append(mat)
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH')
    obj=bpy.context.object;STATIC.append(obj)
for index,wiremat in enumerate((red,blue,gold,ledlit)):
    endpoint_x=oled_x-2.24*oled_scale
    endpoint_y=oled_y + (-.30+index*.20)*oled_scale
    port_y = ja_y if index < 2 else jb_y
    oled_wire(f'OLED_4PIN_wire_{index}',[(ja_x+.42,port_y,.31),(ja_x+.76,port_y,.31),(endpoint_x-.32,endpoint_y,.31),(endpoint_x,endpoint_y,.31)],wiremat)

# A compact 30 mm axial fan sits on the open left half of the board. Its
# square frame, corner screws, swept blades, hub, and finger guards are
# separate GLB nodes for a clear manufactured cooling-fan silhouette.
fan_px, fan_py = 440, 810
fan_parts_start = len(STATIC)
frame_px, frame_rail = 370, 30
for side,dx,dy,w,h in [
    ('Left',-frame_px/2+frame_rail/2,0,frame_rail,frame_px),
    ('Right',frame_px/2-frame_rail/2,0,frame_rail,frame_px),
    ('Top',0,-frame_px/2+frame_rail/2,frame_px-2*frame_rail,frame_rail),
    ('Bottom',0,frame_px/2-frame_rail/2,frame_px-2*frame_rail,frame_rail),
]:
    box(f'CoolingFan_Frame_{side}',fan_px+dx,fan_py+dy,w,h,.13,.16,plastic,bevel=.035)
for dx in (-frame_px/2+34,frame_px/2-34):
    for dy in (-frame_px/2+34,frame_px/2-34):
        ring('CoolingFan_Mount_Hole',fan_px+dx,fan_py+dy,.12,.078,.294,metal,24)
        cylinder('CoolingFan_Hole_Shadow',fan_px+dx,fan_py+dy,.075,.008,.285,icmat,24)
rotor_hub=cylinder('CoolingFan_Rotor_Hub',fan_px,fan_py,.36,.18,.265,icmat,32)
hub_label=cylinder('CoolingFan_Hub_Label',fan_px,fan_py,.245,.012,.36,white,32)
fan_blade_mat=material('Cooling_fan_blade_graphite',(.105,.125,.128),.13,.43)
fan_x,fan_y=xy(fan_px,fan_py)
for blade_index in range(7):
    angle=math.tau*blade_index/7
    # Swept, tapered blade polygon in the plane of the rotor.
    profile=[(.30,-.14),(.45,-.34),(.77,-.42),(1.10,-.32),(1.22,-.20),(1.02,-.09),(.67,.025),(.40,.075)]
    verts=[]
    for radius_side,tangent_side in profile:
        x=radius_side*math.cos(angle)-tangent_side*math.sin(angle)
        y=radius_side*math.sin(angle)+tangent_side*math.cos(angle)
        verts.append((x,y,0))
    blade=mesh_obj(f'CoolingFan_Blade_{blade_index}',verts,[tuple(range(len(verts)))],fan_blade_mat)
    blade.location=(fan_x,fan_y,.325)
    solid=blade.modifiers.new('Blade_thickness','SOLIDIFY');solid.thickness=.035
    bevel=blade.modifiers.new('Soft_blade_edges','BEVEL');bevel.width=.018;bevel.segments=2
    blade.modifiers.new('Blade_normals','WEIGHTED_NORMAL')
# Keep the blades and center badge in a rotor assembly that the web scene spins.
for obj in [hub_label,*[bpy.data.objects[f'CoolingFan_Blade_{i}'] for i in range(7)]]:
    world=obj.matrix_world.copy();obj.parent=rotor_hub;obj.matrix_world=world
INTERACTIVE.extend(STATIC[fan_parts_start:]); del STATIC[fan_parts_start:]
fan_plug_x=fan_px+1.83*120.74
fan_plug=material('Cooling_fan_connector_PBT',(.78,.78,.72),0,.52)
box('CoolingFan_2Pin_Plug',fan_plug_x,fan_py,48,38,.12,.23,fan_plug,bevel=.025)
for pin_i in range(2):
    cylinder('CoolingFan_Connector_Contact',fan_plug_x-7+pin_i*14,fan_py,.033,.06,.20,gold,12)
for wire_index,wiremat in enumerate((red,icmat)):
    offset=-.08+wire_index*.16
    oled_wire(f'CoolingFan_Lead_{wire_index}',[(fan_x+1.27,fan_y+offset,.31),(fan_x+1.48,fan_y+offset*1.4,.33),(fan_x+1.67,fan_y+offset,.33),(fan_x+1.82,fan_y+offset,.30)],wiremat)

# Configuration shunts, unpopulated test headers, status and RGB LEDs.
for name,x,y,w,h in [('JP3',146,361,78,26),('JP2',299,656,26,78),('JP1',1173,470,65,28)]:
    box(name+'_header',x,y,w+32,h,.11,.16,plastic);box(name+'_blue_shunt',x,y,w,h,.16,.27,blue)
for x,y,count,vertical in [(430,349,5,True),(1034,339,6,False),(1176,1159,6,False),(508,737,2,True),(508,911,2,True),(508,1011,2,True)]:
    for i in range(count): ring('Testpoint_gold',x if vertical else x+i*30,y+i*30 if vertical else y,.063,.038,.163)
for name,x,y in [('POWER_LED',355,354),('DONE_LED',1018,668),('BUSY_LED',547,514),('UART_TX',183,607),('UART_RX',236,607),('RGB16',986,954),('RGB17',954,954)]:
    box(name+'_pads',x,y,25,13,.025,.16,solder)
    o=box(name,x,y,16,11,.035,.185,ledoff,True);o['control']='status_led'

# Merge only noninteractive geometry by material. Preserve all control mesh names.
# Moving ridges become children of sliders and are joined into their parent first.
for cap in list(INTERACTIVE):
    children=[child for child in cap.children if child in STATIC]
    if children:
        bpy.ops.object.select_all(action='DESELECT');cap.select_set(True)
        for c in children: c.select_set(True);STATIC.remove(c)
        bpy.context.view_layer.objects.active=cap;bpy.ops.object.join()

groups={}
for o in STATIC:
    if o.type=='MESH':groups.setdefault(o.data.materials[0].name,[]).append(o)
for name,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name='Static_'+name
    if name not in ('Solder_mask_deep_teal','Silkscreen_ink') and not name.endswith('_laser_mark'):
        bevel=o.modifiers.new('Edge_highlights','BEVEL');bevel.width=.008;bevel.segments=1
        bevel=o.modifiers.new('Weighted_normals','WEIGHTED_NORMAL')

scene=bpy.context.scene
scene.world.color=(.015,.015,.015)
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1600;scene.render.resolution_y=1500;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.015,.015,.015,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.3
def area(name,pos,power,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
    o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
area('Softbox_key',(-6,-4,12),1800,9)
area('Softbox_fill',(7,4,8),1200,7)
area('Edge_light',(-3,7,5),900,5)
data=bpy.data.cameras.new('Preview_camera');camera=bpy.data.objects.new('Preview_camera',data);bpy.context.collection.objects.link(camera);scene.camera=camera

# Export dark diffusers; the website drives shared live materials without destroying IDs.
objects=[o for o in scene.objects if o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ASSETS/'nexys4-ddr.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_yup=True,export_cameras=False,export_lights=False)
manifest={'reference':'User-supplied Nexys 4 DDR front photograph','nominal_dimensions':[12.2,1315*S,.16],'units':'model units; nominal centimeters, not mechanical CAD','switches':[f'SW{i}_Slider' for i in range(16)],'buttons':[n+'_Plunger' for n,*_ in buttons],'leds':[f'LED{i}' for i in range(16)],'segments':[f'Digit{i}_Segment{s}' for i in range(8) for s in ['A','B','C','D','E','F','G','DP']],'power_switch':'SW16_Slider','oled':{'mesh':'OLED_SCREEN','interface':'JA + JB Pmod four-pin harness','scale':oled_scale,'yaw_radians':oled_yaw,'connector_edge':'left edge faces FPGA','connector_pins':['VCC','GND','SCL','SDA'],'screen_dimensions_cm':[3.27*oled_scale,1.8*oled_scale],'carrier_dimensions_cm':[4.55*oled_scale,2.82*oled_scale],'standalone_asset':'public/models/oled-module.glb','position':'enlarged horizontal red carrier spanning JA and JB with a four-wire left-edge harness'},'cooling_fan':{'rotor_node':'CoolingFan_Rotor_Hub','frame_nodes':[f'CoolingFan_Frame_{side}' for side in ('Left','Right','Top','Bottom')],'blade_nodes':[f'CoolingFan_Blade_{i}' for i in range(7)],'position':'left half of board'},'branding':'Personalized Rigved Koli silkscreen; vendor logos removed','mesh_count':len(objects),'glb_bytes':(ASSETS/'nexys4-ddr.glb').stat().st_size}
(ASSETS/'nexys4-ddr.manifest.json').write_text(json.dumps(manifest,indent=2))
for image in bpy.data.images:
    if image.source=='FILE':image.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'modeling/nexys4-ddr.blend'))

def render(name,pos,target=(0,0,0),ortho=15):
    camera.location=pos;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler();data.type='ORTHO';data.ortho_scale=ortho
    scene.render.filepath=str(PREVIEWS/name);bpy.ops.render.render(write_still=True)
render('nexys4-ddr-top.png',(0,0,21),target=(1.8,0,0),ortho=18.2)
render('nexys4-ddr-studio.png',(10,-14,17),target=(1.2,0,0),ortho=19)
glyphs={'0':'ABCDEF','1':'BC','2':'ABDEG','3':'ABCDG','4':'BCFG','5':'ACDFG','6':'ACDEFG','7':'ABC','8':'ABCDEFG','9':'ABCDFG'}
for col,char in enumerate('20260001'):
    digit=7-col
    for seg in glyphs[char]:bpy.data.objects[f'Digit{digit}_Segment{seg}'].data.materials[0]=redlit
for i in (0,4,9,15):bpy.data.objects[f'LED{i}'].data.materials[0]=ledlit
render('nexys4-ddr-display-detail.png',(0,-8,12),target=(-.7,-3.8,.2),ortho=9)
print('MODEL_COMPLETE',json.dumps(manifest),flush=True)
# The standalone macOS bpy 4.2 wheel can crash in interpreter teardown after
# successful saves/renders. All outputs are explicitly finished before exiting.
import os, sys
sys.stdout.flush();sys.stderr.flush();os._exit(0)
