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
