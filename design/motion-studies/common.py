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
