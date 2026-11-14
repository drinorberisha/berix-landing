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

camera.location=(9,-13,8);aim(camera,(-.1,.1,2.35));scene['BERIX_camera_target']=[-.1,.1,2.35]
"""Original BERIX legal-retrieval sculpture, geometry and deterministic pose only.

Run in the new project after root defines box(), tube(), sphere(), and material M.
No files, external assets, lights, cameras, renderer settings, or scene clearing.
pose_legal(frame) is periodic over 360 frames at 30 fps (12 seconds).
"""
import bpy
import math
from mathutils import Vector

if any(o.name.startswith('LEGAL_') for o in bpy.context.scene.objects):
    raise RuntimeError('LEGAL geometry already exists; preserve it and use a new scene.')

_legal_before = set(bpy.context.scene.objects)
LEGAL_ANIMATED = []
_legal_docs = []
_legal_fragments = []
_legal_tracers = []
_legal_tokens = []
_legal_highlights = []


def _legal_empty(name, location=(0, 0, 0), parent=None):
    o = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(o)
    o.parent = parent
    o.location = location
    return o


def _legal_box(name, location, size, material, bevel=.01, parent=None):
    o = box(name, location, size, material, bevel=bevel, parent=parent)
    o.parent = parent
    o.location = location
    return o


def _legal_sphere(name, location, radius, material, parent=None):
    o = sphere(name, location, radius, material, parent=parent)
    o.parent = parent
    o.location = location
    return o


def _legal_bars(name, bars, material, parent=None):
    """One object for many micro-engraved rectangular text rules, in local X/Z."""
    verts, faces = [], []
    for cx, cy, cz, sx, sy, sz in bars:
        q = len(verts)
        verts += [(cx+x*sx/2, cy+y*sy/2, cz+z*sz/2)
                  for x, y, z in [(-1,-1,-1), (1,-1,-1), (1,1,-1), (-1,1,-1),
                                  (-1,-1,1), (1,-1,1), (1,1,1), (-1,1,1)]]
        faces += [tuple(q+i for i in f) for f in
                  [(3,2,1,0), (4,5,6,7), (0,1,5,4), (1,2,6,5),
                   (2,3,7,6), (3,0,4,7)]]
    mesh = bpy.data.meshes.new(name + '_mesh')
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(material)
    mesh.update()
    o = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(o)
    o.parent = parent
    return o


def _legal_arc(name, center, radius, begin, end, thickness, material, parent=None):
    n = max(16, int(abs(end-begin)*14))
    pts = [(center[0]+radius*math.cos(begin+(end-begin)*j/n),
            center[1],
            center[2]+radius*math.sin(begin+(end-begin)*j/n))
           for j in range(n+1)]
    return tube(name, pts, thickness, material, parent=parent)


def _legal_ease(a, b, x):
    t = max(0.0, min(1.0, (x-a)/(b-a)))
    return t*t*(3-2*t)


def _legal_bezier(points, t):
    a,b,c,d = [Vector(p) for p in points]
    v = 1-t
    return a*v*v*v + b*3*v*v*t + c*3*v*t*t + d*t*t*t


# The archive is an open, curved index field, deliberately not a pile of books.
# Every panel has a margin, heading, three paragraph groups, footer, and citations.
for row in range(3):
    for col in range(7):
        idx = row*7+col
        x = -4.85 + col*.88
        y = .70 + .052*(x+2.1)**2 + row*.12
        z = .82 + row*1.34
        rig = _legal_empty('LEGAL_Document_%02d'%idx, (x,y,z))
        rig.rotation_euler.z = .043*(x+2.1)
        rig['meaning'] = 'Illustrative indexed source fragment; not client document content.'
        rig['rest_location'] = list(rig.location)
        rig['rest_rotation'] = list(rig.rotation_euler)
        _legal_docs.append((rig, Vector(rig.location), rig.rotation_euler.z, idx))
        LEGAL_ANIMATED.append(rig)

        _legal_box('LEGAL_Document_%02d_Glass'%idx, (0,0,0), (.78,.032,1.12),
                   M['glass'], .024, rig)
        # Quiet ivory inner carrier makes the fine rules legible through the glass.
        _legal_box('LEGAL_Document_%02d_Content'%idx, (0,-.022,0), (.706,.012,1.044),
                   M['ivory'], .015, rig)
        border = [(-.383,-.014,0,.009,.013,1.07),
                  (.383,-.014,0,.009,.013,1.07),
                  (0,-.014,-.548,.73,.013,.009),
                  (0,-.014,.548,.73,.013,.009)]
        _legal_bars('LEGAL_Document_%02d_Index_Rim'%idx, border, M['metal'], rig)

        # Fine, deliberately varied rules form actual paragraph structures.
        bars = [(-.144,-.033,.421,.33,.007,.023),
                (-.192,-.033,.367,.235,.007,.008),
                (-.313,-.033,-.008,.004,.007,.66)]
        for group in range(3):
            for line in range(6):
                width = .46 - .038*((line*7+group*3+idx)%5)
                if line == 5: width *= .63
                xline = -.266 + width/2
                zline = .274 - group*.215 - line*.025
                bars.append((xline,-.034,zline,width,.006,.006))
        bars += [(-.157,-.034,-.447,.22,.006,.005),
                 (.192,-.034,-.447,.095,.006,.005),
                 (.280,-.034,.409,.018,.006,.019)]
        _legal_bars('LEGAL_Document_%02d_Paragraphs'%idx, bars, M['ink'], rig)

        # Encoded source identifiers: a small, unique bar sequence, not faux text.
        metadata = [(-.265+j*.028,-.036,-.491,.013,.006,
                     .015+.007*((idx+j*3)%4)) for j in range(11)]
        _legal_bars('LEGAL_Document_%02d_Citation_Code'%idx, metadata, M['olive'], rig)

# Two separated retrieval arcs: exact matching and a broader semantic neighborhood.
_legal_lens = _legal_empty('LEGAL_Query_Lens', (-1.75,-.76,2.25))
_legal_lens['meaning'] = 'Query selection aperture; an abstract retrieval metaphor.'
LEGAL_ANIMATED.append(_legal_lens)
_legal_lens_rotors = []
for j, (radius, depth, material, width) in enumerate([
        (1.67,0,M['metal'],.024),
        (1.56,-.13,M['glass'],.075),
        (1.47,-.25,M['olive'],.018)]):
    rotor = _legal_empty('LEGAL_Query_Rotor_%d'%j, (0,depth,0), _legal_lens)
    _legal_lens_rotors.append(rotor)
    LEGAL_ANIMATED.append(rotor)
    # Three long arcs, with gaps that make the counterrotation readable.
    for segment in range(3):
        angle = segment*math.tau/3 + j*.16
        _legal_arc('LEGAL_Query_Arc_%d_%d'%(j,segment), (0,0,0), radius,
                   angle+.09,angle+math.tau/3-.16,width,material,rotor)

# Twelve etched registration marks around the frontmost lens layer.
ticks = []
for j in range(12):
    angle = math.tau*j/12
    r = 1.48
    # Square marks appear engraved rather than as a busy ornamental clock face.
    ticks.append((r*math.cos(angle),-.268,r*math.sin(angle),.025,.009,.025))
_legal_bars('LEGAL_Query_Registration', ticks, M['trace'], _legal_lens)

# The output is a large, thin evidence surface. It never hides its source routes.
_legal_return = _legal_empty('LEGAL_Evidence_Surface', (4.12,-1.39,2.25))
_legal_return.rotation_euler.z = -.055
LEGAL_ANIMATED.append(_legal_return)
_legal_box('LEGAL_Evidence_Glass', (0,.04,0), (2.16,.065,2.88),M['glass'],.055,_legal_return)
_legal_box('LEGAL_Evidence_Canvas', (0,-.008,0), (2.02,.021,2.71),M['ivory'],.035,_legal_return)
_legal_bars('LEGAL_Evidence_Heading', [(-.34,-.03,1.10,.99,.009,.035),
                                    (-.60,-.03,.99,.47,.009,.009),
                                    (0,-.03,.88,1.67,.009,.008)],M['ink'],_legal_return)
_legal_bars('LEGAL_Evidence_Footer', [(-.60,-.03,-1.16,.43,.009,.007),
                                   (.56,-.03,-1.16,.56,.009,.007),
                                   (-.93,-.03,0,.008,.009,2.31)],M['olive'],_legal_return)

# Three selected passages retain explicit source-to-result connections.
# These indices are only internal artistic identifiers, not actual legal citations.
_legal_selected = [3, 10, 17]
for j, doc_index in enumerate(_legal_selected):
    doc = _legal_docs[doc_index][0]
    # Compute the simple rest anchor without depending on depsgraph evaluation.
    start = Vector(_legal_docs[doc_index][1]) + Vector((.28,-.13,.15-j*.07))
    end = Vector((3.95,-1.49,2.82-j*.69))
    path = [tuple(start), (start.x+.85,-.55,start.z+.36),
            (2.06,-1.39,end.z+.12), tuple(end)]
    samples = [tuple(_legal_bezier(path,k/48)) for k in range(49)]
    tube('LEGAL_Citation_Route_%d'%j,samples,.009,M['trace'])
    # A paired, shorter cherry trace is the visible active provenance route.
    tube('LEGAL_Citation_Active_%d'%j,samples[16:39],.012,M['cherry'])

    # Cherry underlines on the selected source passages.
    underline = _legal_box('LEGAL_Source_Highlight_%d'%j,
                           (-.065,-.043,.13-j*.07),(.46,.008,.016),
                           M['cherry'],.004,doc)
    _legal_highlights.append((underline, j, Vector(underline.scale)))
    LEGAL_ANIMATED.append(underline)
    _legal_sphere('LEGAL_Source_Anchor_%d'%j,(.30,-.055,.15-j*.07),.025,M['cherry'],doc)

    # A discrete extract travels from the document to its evidence dock.
    extract = _legal_empty('LEGAL_Returned_Passage_%d'%j,tuple(start))
    extract['meaning'] = 'Illustrative returned passage with source provenance.'
    _legal_box('LEGAL_Returned_Passage_%d_Panel'%j,(0,0,0),(1.52,.025,.51),
               M['stone'],.025,extract)
    paragraph = []
    for line in range(7):
        width = 1.18-.075*((line+j*2)%4)
        paragraph.append((-.60+width/2,-.020,.153-line*.044,width,.006,.008))
    paragraph.append((-.667,-.020,0,.019,.006,.36))
    _legal_bars('LEGAL_Returned_Passage_%d_Excerpt'%j,paragraph,M['ink'],extract)
    _legal_box('LEGAL_Returned_Passage_%d_Citation'%j,
               (.56,-.023,-.164),(.11,.009,.020),M['cherry'],.004,extract)
    _legal_fragments.append((extract, path, j))
    LEGAL_ANIMATED.append(extract)

    for bead in range(7):
        tracer = _legal_sphere('LEGAL_Citation_Pulse_%d_%d'%(j,bead),tuple(start),
                              .019 if bead%3 else .028,M['glow'])
        _legal_tracers.append((tracer,path,bead/7,j,Vector(tracer.scale)))
        LEGAL_ANIMATED.append(tracer)

# A visible query input makes the field respond to an input rather than levitate.
_legal_query_path = [(-5.85,-1.12,2.23),(-4.65,-1.12,2.23),
                     (-3.67,-1.12,2.23),(-2.96,-1.12,2.23)]
tube('LEGAL_Query_Input_Trace',_legal_query_path,.010,M['metal'])
for j in range(6):
    token = _legal_box('LEGAL_Query_Token_%d'%j,(-5.8,-1.12,2.23),
                       (.12+.025*(j%3),.055,.055),M['cherry'],.012)
    _legal_tokens.append((token,j/6))
    LEGAL_ANIMATED.append(token)

# Quiet depth/detail: connected semantic micro-neighborhoods, not random stars.
_legal_cluster_points = []
for cluster, center in enumerate([(-3.82,1.87,4.32),(-1.45,1.56,4.49),(.88,1.58,3.75)]):
    for j in range(9):
        angle = j*2.399963 + cluster*.4
        p = (center[0]+math.cos(angle)*(.11+.035*j),
             center[1]+math.sin(angle)*.16,
             center[2]+math.sin(angle)*(.13+.027*j))
        node = _legal_sphere('LEGAL_Semantic_%d_%d'%(cluster,j),p,
                             .022 if j else .043,M['olive'] if j else M['cherry'])
        _legal_cluster_points.append((node,Vector(p),cluster,j,Vector(node.scale)))
        LEGAL_ANIMATED.append(node)
        if j:
            tube('LEGAL_Semantic_Link_%d_%d'%(cluster,j),[center,p],.0045,M['metal'])


def pose_legal(frame):
    """Deterministic, continuously active 12 s retrieval story; no camera edits."""
    u = ((float(frame)-1.0) % 360.0)/360.0
    a = math.tau*u
    for doc,rest,yaw,idx in _legal_docs:
        doc.location = rest + Vector((.018*math.sin(a+idx*.71),
                                      .030*math.sin(a+idx*.43),
                                      .024*math.sin(a+idx*.37)))
        doc.rotation_euler.z = yaw+.012*math.sin(a+idx*.5)
    # A measured scanning sweep, with two optical layers counter-rotating.
    _legal_lens.location = (-1.75+.67*math.sin(a),-.76+.06*math.sin(a+.6),
                            2.25+.22*math.sin(a+.4))
    _legal_lens.rotation_euler.z = .045*math.sin(a)
    for j,rotor in enumerate(_legal_lens_rotors):
        rotor.rotation_euler.y = a*(1 if j%2==0 else -1)+j*.21
    _legal_return.location = (4.12,-1.39+.022*math.sin(a),2.25+.025*math.sin(a+.3))

    # Gather in a short sequence, inspect the returned evidence, then recirculate.
    # Scaling makes the small source extracts expand meaningfully on the journey.
    for extract,path,j in _legal_fragments:
        progress = _legal_ease(.18+j*.035,.43+j*.035,u) * (1-_legal_ease(.78,.97,u))
        extract.location = _legal_bezier(path,progress)
        extract.scale = (.27+.73*progress, .55+.45*progress, .27+.73*progress)
        extract.rotation_euler = (.10*math.sin(a+j)*(1-progress),
                                  .04*math.sin(a+j),
                                  -.055*progress+.05*math.sin(a+j)*(1-progress))
    for underline,j,rest_scale in _legal_highlights:
        energy = _legal_ease(.10+j*.035,.22+j*.035,u)*(1-_legal_ease(.84,.98,u))
        underline.scale.x = rest_scale.x*(.05+.95*energy)
    for tracer,path,offset,j,rest_scale in _legal_tracers:
        t = (u*2.0+offset+j*.09)%1.0
        tracer.location = _legal_bezier(path,t)
        tracer.scale = rest_scale
    for token,offset in _legal_tokens:
        t = (u*3+offset)%1.0
        token.location = _legal_bezier(_legal_query_path,t)
    for node,rest,cluster,j,rest_scale in _legal_cluster_points:
        node.location = rest+Vector((.016*math.sin(a+j),.018*math.cos(a+j),
                                     .020*math.sin(a+cluster+j*.3)))
        s = 1+.16*math.sin(a*2+cluster+j*.4)
        node.scale = tuple(component*s for component in rest_scale)


pose_legal(1)

# Re-home only the objects this helper created. Never touch unrelated collections.
LEGAL_CREATED = list(set(bpy.context.scene.objects)-_legal_before)
_legal_col = bpy.data.collections.get('HERO_Legal')
if _legal_col is None:
    _legal_col = bpy.data.collections.new('HERO_Legal')
    bpy.context.scene.collection.children.link(_legal_col)
for obj in LEGAL_CREATED:
    if _legal_col not in obj.users_collection:
        _legal_col.objects.link(obj)
    for old_col in list(obj.users_collection):
        if old_col != _legal_col:
            old_col.objects.unlink(obj)

LEGAL_REPORT = {
    'created_objects':len(LEGAL_CREATED),
    'animated_objects':len(LEGAL_ANIMATED),
    'source_documents':21,
    'returned_passages':3,
    'source_content':'Procedural illustrative engraving; no client/legal document content.',
    'period_frames':360,
    'fps':30,
    'takes':'Query input → exact/semantic selection → source-linked evidence → recirculate.',
    'camera_suggestion':'View from (9,-13,8), target (-.1,.1,2.35); preserve all archive lanes and evidence panel.',
}

animated=list(LEGAL_ANIMATED)
pose=pose_legal
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
scene['BERIX_title']="Citation Field"
scene['BERIX_animation']='Original 12 second mechanism study. Loop endpoint frame361 at30fps. Continuous information flow, illustrative records.'
for marker,frame in [('FLOW',1),('SELECT',91),('PROCESS',181),('EVIDENCE',271),('LOOP',361)]:
 scene.timeline_markers.new(marker,frame=frame)
result={'objects':len(scene.objects),'animated_objects':len(animated),'actions':len(bpy.data.actions),'fps':scene.render.fps,'frames':[scene.frame_start,scene.frame_end],'camera':camera.name,'camera_target':list(target)}

import bpy,math,json
from mathutils import Vector
scene=bpy.context.scene
camera=scene.camera
shots=[[[9,-13,8],[-0.1,0.1,2.35]],[[2,-7.5,4.8],[-1.75,-0.76,2.25]],[[7,-7,4.4],[3.5,-1.4,2.25]],[[5,-9,5],[2,-0.7,2.3]],[[9,-13,8],[-0.1,0.1,2.35]]]
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
arcs=[o for o in scene.objects if o.name.startswith('LEGAL_Query_Arc_')]
for old in arcs:
 verts=old.data.vertices
 centers=[tuple(sum((v.co for v in verts[n:n+8]),Vector())/8)for n in range(0,len(verts),8)]
 centers=centers[int(len(centers)*.15):int(len(centers)*.75)]
 material=old.data.materials[0];parent=old.parent;name=old.name
 radius=.030 if '_1_' in name else (.018 if '_0_' in name else .014)
 bpy.data.objects.remove(old,do_unlink=True)
 replacement=tube(name,centers,radius,material,parent=parent)
 for owner in list(replacement.users_collection):owner.objects.unlink(replacement)
 bpy.data.collections['HERO_Legal'].objects.link(replacement)
reg=bpy.data.objects.get('LEGAL_Query_Registration')
if reg:bpy.data.objects.remove(reg,do_unlink=True)
def curves(action):
 out=list(getattr(action,'fcurves',[]))
 for layer in getattr(action,'layers',[]):
  for strip in layer.strips:
   for bag in getattr(strip,'channelbags',[]):out.extend(bag.fcurves)
 return out
moved=0
for idx in range(21):
 if idx in [3,10,17]:continue
 obj=bpy.data.objects.get('LEGAL_Document_%02d'%idx)
 delta=.58*math.sin(idx*.9)+.18*(idx//7)
 if obj.animation_data and obj.animation_data.action:
  for fc in curves(obj.animation_data.action):
   if fc.data_path=='location' and fc.array_index==1:
    for point in fc.keyframe_points:
     point.co.y+=delta;point.handle_left.y+=delta;point.handle_right.y+=delta
 moved+=1
scene.frame_set(1)
scene['BERIX_refinement']='Open offset retrieval segments and a document index with depth. Source-linked selected passages retain their exact anchors.'
result={'open_retrieval_segments':len(arcs),'depth_staggered_sources':moved}
