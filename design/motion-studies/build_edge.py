"""Original BERIX motion studies. Helpers for NEW EMPTY Blender scenes only."""
import bpy
import math
from mathutils import Vector

scene = bpy.context.scene
if len(scene.objects):
    raise RuntimeError('Preserve existing work: use a new empty scene.')
scene.render.engine = 'BLENDER_EEVEE'
scene.eevee.taa_render_samples = 32
scene.render.resolution_x = 1280
scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 361
scene.world = bpy.data.worlds.new('ENV_Warm_Studio')
scene.world.use_nodes = True
world_bg = scene.world.node_tree.nodes.get('Background')
world_bg.inputs[0].default_value = (0.46, 0.44, 0.40, 1)
world_bg.inputs[1].default_value = 0.6
scene.view_settings.view_transform = 'AgX'
scene.view_settings.exposure = 0.45
scene['BERIX_intent'] = 'Original mechanism studies, based on public case studies. Illustrative data, not a measured system simulation.'

def lin(v):
    return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4

def mat(name, color, roughness=.35, metallic=0., transmission=0., emission=0.):
    m = bpy.data.materials.new('MAT_' + name)
    m.use_nodes = True
    c = tuple(lin(int(color[i:i+2], 16) / 255) for i in (0, 2, 4))
    m.diffuse_color = (*c, 1)
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*c, 1)
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Transmission Weight'].default_value = transmission
    p.inputs['IOR'].default_value = 1.46
    p.inputs['Coat Weight'].default_value = .25 if metallic else .12
    if emission:
        p.inputs['Emission Color'].default_value = (*c, 1)
        p.inputs['Emission Strength'].default_value = emission
    return m

M = {
    'ivory': mat('Ivory_Porcelain', 'FCFAF6', .24, .04),
    'stone': mat('Warm_Stone', 'D6D3C9', .46),
    'olive': mat('Anodized_Olive', '566044', .24, .55),
    'cherry': mat('Cherry_Trace', '9A3F46', .19, .22),
    'ink': mat('Walnut_Carbon', '35291F', .30, .35),
    'metal': mat('Satin_Nickel', 'AAA99F', .22, .82),
    'glass': mat('Optical_Glass', 'D8DFD0', .09, .0, .65),
    'glow': mat('Live_Connection', 'BD6066', .24, .1, .0, 1.5),
    'trace': mat('Quiet_Trace', '949C83', .32, .3),
}

def mesh_object(name, vertices, faces, material, parent=None):
    mesh = bpy.data.meshes.new('GEO_' + name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    if material:
        mesh.materials.append(material)
    if parent:
        obj.parent = parent
    return obj

def box(name, loc, size, material, bevel=.03, parent=None):
    x, y, z = [s / 2 for s in size]
    vertices = [(-x,-y,-z),(x,-y,-z),(x,y,-z),(-x,y,-z),(-x,-y,z),(x,-y,z),(x,y,z),(-x,y,z)]
    faces = [(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    obj = mesh_object(name, vertices, faces, material, parent)
    obj.location = loc
    if bevel > 0:
        modifier = obj.modifiers.new('Precision_Chamfer', 'BEVEL')
        modifier.width = min(bevel, min(size) * .45)
        modifier.segments = 3
    return obj

def tube(name, points, radius, material, parent=None):
    points = [Vector(p) for p in points]
    vertices, faces = [], []
    sides = 8
    for index, point in enumerate(points):
        tangent = (points[min(index+1,len(points)-1)] - points[max(index-1,0)]).normalized()
        helper = Vector((0,0,1)) if abs(tangent.z) < .95 else Vector((0,1,0))
        a = tangent.cross(helper).normalized()
        b = tangent.cross(a).normalized()
        for side in range(sides):
            angle = side * math.tau / sides
            vertices.append(tuple(point + radius * (a*math.cos(angle) + b*math.sin(angle))))
        if index:
            for side in range(sides):
                faces.append(((index-1)*sides+side,(index-1)*sides+(side+1)%sides,index*sides+(side+1)%sides,index*sides+side))
    faces.append(tuple(reversed(range(sides))))
    faces.append(tuple((len(points)-1)*sides+s for s in range(sides)))
    obj = mesh_object(name, vertices, faces, material, parent)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj

def sphere(name, loc, radius, material, parent=None):
    vertices, faces = [], []
    segments, rings = 12, 6
    for row in range(rings+1):
        phi = math.pi * row / rings
        for col in range(segments):
            theta = math.tau * col / segments
            vertices.append((radius*math.sin(phi)*math.cos(theta),radius*math.sin(phi)*math.sin(theta),radius*math.cos(phi)))
    for row in range(rings):
        for col in range(segments):
            faces.append((row*segments+col,row*segments+(col+1)%segments,(row+1)*segments+(col+1)%segments,(row+1)*segments+col))
    obj = mesh_object(name, vertices, faces, material, parent)
    obj.location = loc
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj

def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z','Y').to_euler()

camera_data = bpy.data.cameras.new('CAM_main')
camera = bpy.data.objects.new('CAM_main', camera_data)
scene.collection.objects.link(camera)
camera.location = (11, -16, 12)
camera_data.lens = 48
aim(camera, (0,0,1.8))
scene.camera = camera
scene['BERIX_camera_target'] = [0, 0, 1.8]
key_data = bpy.data.lights.new('LGT_key', 'SUN')
key_data.energy = 2.1
key_data.angle = .25
key = bpy.data.objects.new('LGT_key', key_data)
scene.collection.objects.link(key)
key.rotation_euler = (math.radians(26),math.radians(-22),math.radians(-25))
fill_data = bpy.data.lights.new('LGT_fill', 'POINT')
fill_data.energy = 1800
fill_data.shadow_soft_size = 5
fill = bpy.data.objects.new('LGT_fill', fill_data)
scene.collection.objects.link(fill)
fill.location = (-3,-4,7)

floor = box('ENV_Studio_Surface', (0,0,-.1), (200,200,.1), M['ivory'], 0)

camera.location=(10,-14,11);aim(camera,(0,0,1.8));scene['BERIX_camera_target']=[0,0,1.8]
"""Signal Surface: 128 distributed scoring cells and uninterrupted market flow."""
import bpy
import math
from mathutils import Vector

def build_edge(box, tube, sphere, M, scene=None):
    scene = scene or bpy.context.scene
    prior = set(scene.objects)
    collection = bpy.data.collections.new('HERO_Edge')
    scene.collection.children.link(collection)
    cells, packets = [], []

    def surface(x, y):
        return 1.25 + .32*math.sin(.65*x + .48*y) + .14*math.cos(y*1.4)

    def path_point(lane, t):
        x = -5.8 + 11.6*t
        y = (lane-3.5)*.72 + .16*math.sin(t*math.tau)
        return (x, y, surface(x,y))

    # Each scoring tile is a distributed local operation. The waves pass through
    # the array; no central processor or topology is implied.
    shared_body = shared_glass = None
    detail_vertices, detail_faces = [], []
    def detail_box(loc, size):
        x,y,z = [s/2 for s in size]; a,b,c=loc; start=len(detail_vertices)
        detail_vertices.extend([(a-x,b-y,c-z),(a+x,b-y,c-z),(a+x,b+y,c-z),(a-x,b+y,c-z),(a-x,b-y,c+z),(a+x,b-y,c+z),(a+x,b+y,c+z),(a-x,b+y,c+z)])
        detail_faces.extend([tuple(start+n for n in f) for f in [(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]])

    for lane in range(8):
        points=[path_point(lane,k/100) for k in range(101)]
        tube(f'FLOW_Signal_Filament_{lane:02}',points,.013,M['olive'])
        tube(f'FLOW_Reference_Envelope_{lane:02}',[(x,y+.16,z-.06) for x,y,z in points],.006,M['trace'])
        for col in range(16):
            x,y,z=path_point(lane,(col+.5)/16)
            if shared_body is None:
                body=box('SCORE_Cell_000',(x,y,z-.06),(.34,.45,.11),M['metal'],.025)
                shared_body=body
            else:
                body=shared_body.copy();body.data=shared_body.data
                body.name=f'SCORE_Cell_{lane*16+col:03}';scene.collection.objects.link(body);body.location=(x,y,z-.06)
            body['scoring_cell']=lane*16+col
            cells.append(body)
            if shared_glass is None:
                top=box('SCORE_Window_000',(x,y,z+.015),(.27,.36,.025),M['glass'],.012)
                shared_glass=top
            else:
                top=shared_glass.copy();top.data=shared_glass.data
                top.name=f'SCORE_Window_{lane*16+col:03}';scene.collection.objects.link(top);top.location=(x,y,z+.015)
            for j in range(3):
                detail_box((x-.06+j*.06,y,z+.04),(.018,.14+j*.022,.018))
        for j in range(7):
            packet=box(f'FLOW_Packet_{lane:02}_{j:02}',(0,0,0),(.17,.048,.045),M['ivory'],.018)
            packet['flow_lane']=lane;packet['phase']=j/7
            packets.append(packet)
    mesh_object('DETAIL_Feature_Operators',detail_vertices,detail_faces,M['ink'])

    # One expanded local scoring aperture opens a readable foreground detail.
    hero=box('HERO_Local_Scoring_Aperture',(1.3,-2.65,2.25),(1.45,1.0,.16),M['ink'],.07)
    box('HERO_Inspection_Window',(1.3,-2.65,2.37),(1.20,.80,.06),M['glass'],.025)
    for j in range(7):
        box(f'DETAIL_Local_Operator_{j}',(.85+j*.14,-2.65,2.42),(.046,.46,.023),M['olive'],.01)
    # Local feature deviation has a different shape as well as a cherry color.
    abnormal=tube('HERO_Abnormal_Sequence',[(.75,-2.65,2.52),(.97,-2.65,2.52),(1.10,-2.65,2.90),(1.25,-2.65,2.30),(1.42,-2.65,2.67),(1.55,-2.65,2.52),(1.83,-2.65,2.52)],.035,M['cherry'])
    alert_path=[(1.85+.04*k,-2.65-.012*k,2.52+.015*k) for k in range(45)]
    tube('FLOW_Independent_Alert_Route',alert_path,.014,M['cherry'])
    alert=sphere('HERO_Local_Alert',alert_path[0],.09,M['glow'])
    for j in range(3):
        p=(3.8,-3.19,3.10+j*.13)
        box(f'OUTCOME_Alert_Evidence_{j}',p,(1.25,.34,.065),M['ivory'],.025)
        for k in range(3):
            box(f'DETAIL_Alert_Record_{j}_{k}',(p[0]-.25+k*.24,p[1]-.18,p[2]),(.12,.012,.02),M['ink'],0)

    for obj in set(scene.objects)-prior:
        for owner in list(obj.users_collection):owner.objects.unlink(obj)
        collection.objects.link(obj)
    scene['BERIX_scoring_cell_count']=128
    return {'collection':collection.name,'cells':len(cells),'objects':len(collection.objects),'packets':len(packets)}

def pose_edge(frame):
    t=(frame-1)/360
    for obj in bpy.data.collections['HERO_Edge'].objects:
        if 'flow_lane' in obj:
            lane=obj['flow_lane'];u=(t*2+obj['phase'])%1
            x=-5.8+11.6*u;y=(lane-3.5)*.72+.16*math.sin(u*math.tau)
            z=1.25+.32*math.sin(.65*x+.48*y)+.14*math.cos(y*1.4)
            obj.location=(x,y,z+.045)
            # Wrapped flow vanishes at the boundary instead of sweeping back.
            fade=min(1,u*30,(1-u)*30)
            obj.scale=(fade,fade,fade)
        elif obj.name=='HERO_Local_Alert':
            u=(t*2)%1
            obj.location=(1.85+1.76*u,-2.65-.528*u,2.52+.66*u)
            s=.7+.3*math.sin(math.pi*u)
            obj.scale=(s,s,s)
        elif obj.name=='HERO_Abnormal_Sequence':
            obj.location.z=.04*math.sin(math.tau*t)

report=build_edge(box,tube,sphere,M,scene)
pose_edge(61)
scene['BERIX_title']='Signal Surface'
scene['BERIX_case']='Real-Time Anomaly Detection at the Edge'
result=report

animated=[o for o in bpy.data.collections['HERO_Edge'].objects if 'flow_lane' in o or o.name in ['HERO_Local_Alert','HERO_Abnormal_Sequence']]
pose=pose_edge
from mathutils import Vector
camera=scene.camera
base=Vector(camera.location)
target=Vector(scene.get('BERIX_camera_target',[0,0,1.8]))
for frame in range(1,362,3):
 pose(frame)
 for obj in animated:
  for prop in ('location','rotation_euler','scale'):
   obj.keyframe_insert(data_path=prop,frame=frame)
 # Small continuous camera parallax exposes the form instead of a fixed icon.
 phase=(frame-1)/360*math.tau
 camera.location=base+Vector((.6*math.sin(phase),.3*(math.cos(phase)-1),.2*math.sin(phase)))
 aim(camera,target)
 camera.keyframe_insert(data_path='location',frame=frame)
 camera.keyframe_insert(data_path='rotation_euler',frame=frame)
for action in bpy.data.actions:
 curves=list(getattr(action,'fcurves',[]))
 for layer in getattr(action,'layers',[]):
  for strip in layer.strips:
   for bag in getattr(strip,'channelbags',[]):curves.extend(bag.fcurves)
 for curve in curves:
  for key in curve.keyframe_points:key.interpolation='LINEAR'
scene.frame_start=1;scene.frame_end=361;scene.render.fps=30
scene.frame_set(1)
scene['BERIX_title']="Signal Surface"
scene['BERIX_animation']='Original 12 second mechanism study. Loop endpoint frame361 at30fps. Continuous information flow, illustrative records.'
for marker,frame in [('FLOW',1),('SELECT',91),('PROCESS',181),('EVIDENCE',271),('LOOP',361)]:
 scene.timeline_markers.new(marker,frame=frame)
result={'objects':len(scene.objects),'animated_objects':len(animated),'actions':len(bpy.data.actions),'fps':scene.render.fps,'frames':[scene.frame_start,scene.frame_end],'camera':camera.name,'camera_target':list(target)}

import bpy,math,json
from mathutils import Vector
scene=bpy.context.scene
camera=scene.camera
shots=[[[10,-14,11],[0,0,1.8]],[[5,-8,5.7],[1.3,-2.65,2.5]],[[6,-7,4.7],[2.3,-3,2.6]],[[8,-11,8],[1,0,1.8]],[[10,-14,11],[0,0,1.8]]]
scene['BERIX_camera_shots']=json.dumps(shots)
if camera.animation_data:camera.animation_data_clear()
for frame in range(1,362,3):
 u=(frame-1)/360*4
 segment=min(3,int(u));t=u-segment;t=t*t*(3-2*t)
 camera.location=Vector(shots[segment][0]).lerp(Vector(shots[segment+1][0]),t)
 target=Vector(shots[segment][1]).lerp(Vector(shots[segment+1][1]),t)
 camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
 camera.keyframe_insert(data_path='location',frame=frame)
 camera.keyframe_insert(data_path='rotation_euler',frame=frame)
scene.render.engine='BLENDER_EEVEE';scene.eevee.taa_render_samples=128
scene.frame_set(1)
result={'camera':camera.name,'shots':shots,'fps':scene.render.fps,'range':[scene.frame_start,scene.frame_end],'objects':len(scene.objects)}

import bpy, math
from mathutils import Vector
scene=bpy.context.scene
def mesh_object(name, vertices, faces, material, parent=None):
    mesh = bpy.data.meshes.new('GEO_' + name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    if material:
        mesh.materials.append(material)
    if parent:
        obj.parent = parent
    return obj

def box(name, loc, size, material, bevel=.03, parent=None):
    x, y, z = [s / 2 for s in size]
    vertices = [(-x,-y,-z),(x,-y,-z),(x,y,-z),(-x,y,-z),(-x,-y,z),(x,-y,z),(x,y,z),(-x,y,z)]
    faces = [(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    obj = mesh_object(name, vertices, faces, material, parent)
    obj.location = loc
    if bevel > 0:
        modifier = obj.modifiers.new('Precision_Chamfer', 'BEVEL')
        modifier.width = min(bevel, min(size) * .45)
        modifier.segments = 3
    return obj

def tube(name, points, radius, material, parent=None):
    points = [Vector(p) for p in points]
    vertices, faces = [], []
    sides = 8
    for index, point in enumerate(points):
        tangent = (points[min(index+1,len(points)-1)] - points[max(index-1,0)]).normalized()
        helper = Vector((0,0,1)) if abs(tangent.z) < .95 else Vector((0,1,0))
        a = tangent.cross(helper).normalized()
        b = tangent.cross(a).normalized()
        for side in range(sides):
            angle = side * math.tau / sides
            vertices.append(tuple(point + radius * (a*math.cos(angle) + b*math.sin(angle))))
        if index:
            for side in range(sides):
                faces.append(((index-1)*sides+side,(index-1)*sides+(side+1)%sides,index*sides+(side+1)%sides,index*sides+side))
    faces.append(tuple(reversed(range(sides))))
    faces.append(tuple((len(points)-1)*sides+s for s in range(sides)))
    obj = mesh_object(name, vertices, faces, material, parent)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj

def sphere(name, loc, radius, material, parent=None):
    vertices, faces = [], []
    segments, rings = 12, 6
    for row in range(rings+1):
        phi = math.pi * row / rings
        for col in range(segments):
            theta = math.tau * col / segments
            vertices.append((radius*math.sin(phi)*math.cos(theta),radius*math.sin(phi)*math.sin(theta),radius*math.cos(phi)))
    for row in range(rings):
        for col in range(segments):
            faces.append((row*segments+col,row*segments+(col+1)%segments,(row+1)*segments+(col+1)%segments,(row+1)*segments+col))
    obj = mesh_object(name, vertices, faces, material, parent)
    obj.location = loc
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj

def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z','Y').to_euler()


M={"ivory":bpy.data.materials["MAT_Ivory_Porcelain"],"stone":bpy.data.materials["MAT_Warm_Stone"],"olive":bpy.data.materials["MAT_Anodized_Olive"],"cherry":bpy.data.materials["MAT_Cherry_Trace"],"ink":bpy.data.materials["MAT_Walnut_Carbon"],"metal":bpy.data.materials["MAT_Satin_Nickel"],"glass":bpy.data.materials["MAT_Optical_Glass"],"glow":bpy.data.materials["MAT_Live_Connection"],"trace":bpy.data.materials["MAT_Quiet_Trace"]}
for o in list(scene.objects):
 if o.name.startswith('BLOCKOUT_'):bpy.data.objects.remove(o,do_unlink=True)
from mathutils import Vector
col=bpy.data.collections['HERO_Edge']
for obj in list(col.objects):
 if obj.name in ['HERO_Local_Scoring_Aperture','HERO_Inspection_Window'] or obj.name.startswith('DETAIL_Local_Operator_'):
  bpy.data.objects.remove(obj,do_unlink=True)
cell=bpy.data.objects['SCORE_Cell_009']
cell.data=cell.data.copy();cell.data.materials.clear();cell.data.materials.append(M['cherry'])
origin=Vector(cell.location)+Vector((0,0,.13))
anomaly=bpy.data.objects['HERO_Abnormal_Sequence']
for vertex in anomaly.data.vertices:vertex.co=origin+(vertex.co-Vector((1.29,-2.65,2.52)))*.30
old=bpy.data.objects.get('FLOW_Independent_Alert_Route')
if old:bpy.data.objects.remove(old,do_unlink=True)
end=Vector((3.65,-3.19,3.10))
points=[]
for j in range(61):
 u=j/60
 p=origin.lerp(end,u);p.z+=.25*math.sin(math.pi*u)
 points.append(tuple(p))
route=tube('FLOW_Independent_Alert_Route',points,.013,M['cherry'])
for owner in list(route.users_collection):owner.objects.unlink(route)
col.objects.link(route)
alert=bpy.data.objects['HERO_Local_Alert']
alert.animation_data_clear()
for frame in range(1,362,3):
 u=((frame-1)/360*2)%1
 p=origin.lerp(end,u);p.z+=.25*math.sin(math.pi*u)
 alert.location=p
 fade=min(1,u*25,(1-u)*25)
 alert.scale=(fade,fade,fade)
 alert.keyframe_insert(data_path='location',frame=frame);alert.keyframe_insert(data_path='scale',frame=frame)
selection=tube('HERO_Local_Scoring_Selection',[(origin.x+dx,origin.y+dy,origin.z-.03)for dx,dy in [(-.20,-.26),(.20,-.26),(.20,.26),(-.20,.26),(-.20,-.26)]],.015,M['cherry'])
for owner in list(selection.users_collection):owner.objects.unlink(selection)
col.objects.link(selection)
# A close local shot, then the alert route and distribution.
import json
camera=scene.camera
shots=json.loads(scene['BERIX_camera_shots'])
shots[1]=[[2.5,-5.3,2.8],[1.1,-2.6,1.05]]
shots[2]=[[6,-7,4.7],[2.3,-3,2.6]]
scene['BERIX_camera_shots']=json.dumps(shots)
camera.animation_data_clear()
for frame in range(1,362,3):
 u=(frame-1)/360*4;segment=min(3,int(u));t=u-segment;t=t*t*(3-2*t)
 camera.location=Vector(shots[segment][0]).lerp(Vector(shots[segment+1][0]),t)
 target=Vector(shots[segment][1]).lerp(Vector(shots[segment+1][1]),t)
 aim(camera,target)
 camera.keyframe_insert(data_path='location',frame=frame);camera.keyframe_insert(data_path='rotation_euler',frame=frame)
scene.frame_set(1)
scene['BERIX_refinement']='The anomaly originates inside ordinary scoring cell009. All128cells remain independent; an external route carries the alert without a central scoring device.'
result={'scoring_cells':sum(o.name.startswith('SCORE_Cell_')for o in scene.objects),'local_origin':list(origin),'objects':len(scene.objects)}
