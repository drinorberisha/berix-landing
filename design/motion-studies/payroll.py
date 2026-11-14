"""Payroll Contract Loom: original, editable geometry and continuous motion poses.

Provided helpers: box(name, loc, size, material, bevel=.03, parent=None),
tube(name, points, radius, material, parent=None), sphere(...), and material dict M.
This module never clears a scene, changes cameras/lights, renders, or saves files.

Usage inside Blender after defining the common helpers:
    payroll = build_payroll(box, tube, sphere, M, scene=bpy.context.scene)
    pose_payroll(1)

Bake location/rotation_euler/scale on payroll['dynamic_objects'] after each pose.
The moving packet empties own their mesh children. Scale is important: it performs
record normalization and makes endpoint wraps disappear inside the source/output.
"""

import math
import bpy
from mathutils import Vector, Matrix


_PAYROLL = None


def _mix(a, b, t):
    return a * (1.0 - t) + b * t


def _smooth(a, b, value):
    t = max(0.0, min(1.0, (value - a) / (b - a)))
    return t * t * (3.0 - 2.0 * t)


def _bezier(points, t):
    p0, p1, p2, p3 = (Vector(p) for p in points)
    return ((1.0 - t) ** 3 * p0 + 3.0 * (1.0 - t) ** 2 * t * p1
            + 3.0 * (1.0 - t) * t * t * p2 + t ** 3 * p3)


def _lane_path(lane, s):
    column, row = lane % 10, lane // 10
    source_y = (column - 4.5) * 0.46
    source_z = 1.10 + row * 1.34 + 0.07 * math.sin(column * 0.7)
    target_y = (lane - 9.5) * 0.065
    target_z = 1.86
    if s <= 0.44:
        return _bezier(((-5.78, source_y, source_z),
                        (-3.85, source_y, source_z),
                        (-2.00, target_y, target_z),
                        (-0.62, target_y, target_z)), s / 0.44)
    if s <= 0.56:
        return Vector((_mix(-0.62, 0.62, (s - 0.44) / 0.12),
                       target_y, target_z))
    t = (s - 0.56) / 0.44
    return _bezier(((0.62, target_y, target_z),
                    (2.30, target_y, target_z),
                    (4.15, target_y, target_z),
                    (5.78, target_y, target_z)), t)


def _retry_path(s):
    if s <= 0.52:
        return _bezier(((0.75, -0.1625, 1.86),
                        (2.50, -1.58, 1.30),
                        (1.05, -2.62, 1.02),
                        (-0.20, -2.02, 1.12)), s / 0.52)
    return _bezier(((-0.20, -2.02, 1.12),
                    (-1.3538461538, -1.4661538462, 1.2123076923),
                    (-1.30, -0.45, 1.82),
                    (-0.62, -0.1625, 1.86)), (s - 0.52) / 0.48)


def _rounded_aperture(x, half_y=1.16, half_z=1.28, radius=0.22):
    points = []
    for cy, cz, start in ((half_y - radius, half_z - radius, 0.0),
                           (-half_y + radius, half_z - radius, math.pi / 2),
                           (-half_y + radius, -half_z + radius, math.pi),
                           (half_y - radius, -half_z + radius, 3 * math.pi / 2)):
        for step in range(9):
            angle = start + step * math.pi / 16
            points.append((x, cy + radius * math.cos(angle),
                           1.86 + cz + radius * math.sin(angle)))
    points.append(points[0])
    return points


def build_payroll(box, tube, sphere, M, scene=None):
    """Create one independently hideable HERO_Payroll collection and pose function."""
    global _PAYROLL
    scene = scene or bpy.context.scene
    collection = bpy.data.collections.new('HERO_Payroll')
    scene.collection.children.link(collection)
    state = {'collection': collection, 'main_packets': [], 'check_pins': [],
             'dynamic_objects': [], 'all_objects': [], 'prototypes': {},
             'period_frames': 360, 'fps': 30}

    def put(obj):
        if collection not in obj.users_collection:
            collection.objects.link(obj)
        for linked in tuple(obj.users_collection):
            if linked != collection:
                linked.objects.unlink(obj)
        state['all_objects'].append(obj)
        return obj

    def solid(name, loc, size, material, bevel=.03, parent=None, key=None):
        prototype = state['prototypes'].get(key) if key else None
        if prototype is None:
            obj = put(box(name, loc, size, material, bevel=bevel, parent=parent))
            if key:
                state['prototypes'][key] = obj
            return obj
        obj = prototype.copy()
        obj.data = prototype.data
        obj.name = name
        obj.parent = parent
        obj.matrix_parent_inverse = Matrix.Identity(4)
        obj.location = loc
        obj.rotation_euler = (0.0, 0.0, 0.0)
        obj.hide_render = False
        return put(obj)

    def line(name, points, radius, material):
        return put(tube(name, points, radius, material))

    def empty(name, role):
        obj = bpy.data.objects.new(name, None)
        collection.objects.link(obj)
        state['all_objects'].append(obj)
        obj['motion_role'] = role
        obj['animated'] = True
        state['dynamic_objects'].append(obj)
        return obj

    # Twenty separate regional record lanes. Their two-depth source arrangement
    # carries varied record formats; the one aperture normalizes their envelope.
    for lane in range(20):
        points = [tuple(_lane_path(lane, index / 55 * .44)) for index in range(56)]
        line(f'Payroll_InputLane_{lane:02d}', points, .014, M['metal'])
        etch = [(x, y, z + .019) for x, y, z in points]
        line(f'Payroll_InputLaneEtch_{lane:02d}', etch, .0045,
             M['cherry'] if lane == 7 else M['trace'])
        origin = _lane_path(lane, 0.0)
        solid(f'Payroll_SourceSocket_{lane:02d}', tuple(origin),
              (.10, .22, .115), M['ink'], .018, key='source_socket')
        solid(f'Payroll_SourceSocketSlot_{lane:02d}',
              (origin.x + .057, origin.y, origin.z + .012),
              (.012, .145, .045), M['metal'], .006, key='source_slot')
        for tick in range(3):
            solid(f'Payroll_SourceEtch_{lane:02d}_{tick}',
                  (origin.x, origin.y - .072 + tick * .072, origin.z + .062),
                  (.057, .008, .004), M['ivory'], .001, key='source_etch')

    # One translucent contract bridge: nested front/back glass boundaries, fine
    # metal indexing marks, and exposed verification teeth around the aperture.
    for depth, x in enumerate((-.23, 0.0, .23)):
        line(f'Payroll_ContractGlass_{depth}', _rounded_aperture(x),
             .072, M['glass'])
    for depth, x in enumerate((-.31, .31)):
        line(f'Payroll_ContractPrecisionRim_{depth}',
             _rounded_aperture(x, 1.18, 1.30, .23), .014, M['metal'])
        line(f'Payroll_ContractInnerTrace_{depth}',
             _rounded_aperture(x, 1.055, 1.175, .19), .0055, M['olive'])
    for ysign in (-1, 1):
        for zsign in (-1, 1):
            solid(f'Payroll_ContractCornerKey_{ysign}_{zsign}',
                  (0.0, ysign * 1.12, 1.86 + zsign * 1.23),
                  (.69, .105, .105), M['metal'], .022,
                  key='contract_corner')
    for index in range(18):
        y = (index - 8.5) * .102
        for side in (-1, 1):
            solid(f'Payroll_ContractLaserMark_{side}_{index:02d}',
                  (-.334, y, 1.86 + side * 1.30),
                  (.012, .012, .030 + .012 * (index % 3)),
                  M['ink'], .001, key=f'laser_mark_{index % 3}')
    for index in range(10):
        y = (index - 4.5) * .145
        pin = solid(f'Payroll_ContractVerificationPin_{index:02d}',
                    (-.12, y, .73), (.20, .045, .12),
                    M['cherry'] if index == 4 else M['olive'], .012,
                    key='verification_active' if index == 4 else 'verification_pin')
        pin['animated'] = True
        pin['motion_role'] = 'contract_check'
        pin['flow_lane'] = index * 2
        pin['rest_location'] = tuple(pin.location)
        state['check_pins'].append(pin)
        state['dynamic_objects'].append(pin)

    # Normalized output is a single ordered ribbon with twenty precisely spaced
    # record channels, fine longitudinal traces, and a transparent reference skin.
    solid('Payroll_NormalizedRibbonSkin', (3.15, 0.0, 1.822),
          (5.30, 1.46, .028), M['glass'], .014)
    for lane in range(20):
        y = (lane - 9.5) * .065
        line(f'Payroll_NormalizedChannel_{lane:02d}',
             [(x, y, 1.86) for x in (.62, 1.5, 3.0, 4.5, 5.78)],
             .012, M['metal'])
        line(f'Payroll_NormalizedTrace_{lane:02d}',
             [(x, y, 1.878) for x in (.62, 1.5, 3.0, 4.5, 5.78)],
             .004, M['trace'])
    for index in range(16):
        x = .85 + index * .31
        solid(f'Payroll_RibbonTimingEtch_{index:02d}', (x, -.735, 1.842),
              (.012, .055, .006), M['ink'], .001, key='ribbon_timing')

    # A visible foreground retry arc forks after verification and re-enters
    # before the contract. It is an explicit path, rather than random debris.
    retry_points = [tuple(_retry_path(index / 90)) for index in range(91)]
    line('Payroll_RetryRoute', retry_points, .021, M['metal'])
    line('Payroll_RetryRouteSignal', [(x, y, z + .026) for x, y, z in retry_points],
         .007, M['cherry'])
    for index in range(3):
        pos = _retry_path(.36 + index * .045)
        solid(f'Payroll_RetryBufferIndex_{index}',
              (pos.x, pos.y, pos.z - .045), (.13, .10, .018),
              M['olive'], .006, key='retry_buffer')

    # A separate fine trace returns along the back of the flow for observability.
    trace_points = [(5.65, .70, 1.81), (5.38, 1.75, 1.32),
                    (3.2, 2.50, 1.12), (0.0, 2.65, 1.09),
                    (-3.2, 2.48, 1.10), (-5.50, 1.70, 1.22)]
    line('Payroll_ObservabilityTrace', trace_points, .009, M['trace'])
    for index, point in enumerate(trace_points[1:-1]):
        marker = put(sphere(f'Payroll_TraceMarker_{index}', point, .035, M['metal']))
        marker['flow_lane'] = -1

    def packet(name, lane, slot, material, role='record'):
        variant = lane % 4
        length = (.245, .29, .34, .385)[variant]
        width = (.15, .18, .21, .165)[variant]
        parent = empty(name, role)
        parent['flow_lane'] = lane
        parent['flow_phase'] = (slot / 3.0 + lane * .019) % 1.0
        parent['base_length'] = length
        parent['base_width'] = width
        solid(name + '_Payload', (0, 0, 0), (length, width, .045), material,
              .012, parent=parent,
              key=f'payload_{variant}_{getattr(material, "name", str(material))}')
        for stripe in range(4):
            fraction = (.52, .78, .42, .66)[(stripe + variant) % 4]
            solid(name + f'_FieldEtch_{stripe}',
                  (-length * .32 + stripe * length * .205, 0, .0255),
                  (.008, width * fraction, .004), M['ink'], .001,
                  parent=parent, key=f'field_{variant}_{stripe}')
        solid(name + '_IdempotencyFingerprint', (length * .40, -width * .27, .026),
              (.018, .025, .005), M['metal'], .001,
              parent=parent, key='fingerprint')
        return parent

    # Sixty moving record groups share a small set of linked payload/etch meshes.
    for lane in range(20):
        for slot in range(3):
            record = packet(f'Payroll_Record_{lane:02d}_{slot}', lane, slot,
                            M['cherry'] if lane == 7 and slot == 0 else M['ivory'])
            state['main_packets'].append(record)
    state['duplicate'] = packet('Payroll_DuplicateEcho', 7, 0, M['stone'],
                                role='duplicate_echo')
    state['duplicate_source'] = state['main_packets'][7 * 3]
    state['retry'] = packet('Payroll_RetryRecord', 7, 0, M['cherry'],
                            role='retry_record')
    _PAYROLL = state
    pose_payroll(1)
    return {
        'collection': collection,
        'objects': tuple(state['all_objects']),
        'dynamic_objects': tuple(state['dynamic_objects']),
        'record_lanes': 20,
        'moving_records': 60,
        'period_frames': 360,
        'fps': 30,
        'mesh_templates': len(state['prototypes']),
        'stats': {'objects': len(state['all_objects']),
                  'curves': sum(obj.type == 'CURVE' for obj in state['all_objects']),
                  'meshes': sum(obj.type == 'MESH' for obj in state['all_objects'])},
        'pose_function': pose_payroll,
    }


def _orient_on_path(obj, path, s):
    position = path(s)
    before, after = path(max(0.0, s - .001)), path(min(1.0, s + .001))
    tangent = after - before
    obj.location = position
    if tangent.length > 1e-6:
        obj.rotation_euler = tangent.to_track_quat('X', 'Z').to_euler()


def pose_payroll(frame):
    """Set one deterministic pose; no keyframes. 1 and 361 are identical."""
    if _PAYROLL is None:
        raise RuntimeError('Call build_payroll before pose_payroll')
    t = ((float(frame) - 1.0) % 360.0) / 360.0
    for obj in _PAYROLL['main_packets']:
        lane = int(obj['flow_lane'])
        s = (3.0 * t + float(obj['flow_phase'])) % 1.0
        _orient_on_path(obj, lambda value: _lane_path(lane, value), s)
        envelope = _smooth(.005, .035, s) * (1.0 - _smooth(.965, .995, s))
        normalized = _smooth(.44, .56, s)
        obj.scale = (envelope * _mix(1, .30 / obj['base_length'], normalized),
                     envelope * _mix(1, .13 / obj['base_width'], normalized),
                     envelope)

    # An extra copy follows the actual highlighted source record and meets its
    # fingerprint at the contract without creating a second output record.
    duplicate = _PAYROLL['duplicate']
    duplicate_source = _PAYROLL['duplicate_source']
    duplicate_start = (1.08 - float(duplicate_source['flow_phase'])) / 3.0
    u = (t - duplicate_start) / .14
    visible = 0.0 <= u <= 1.0
    clamped = max(0.0, min(1.0, u))
    source_s = .08 + .42 * clamped
    _orient_on_path(duplicate, lambda value: _lane_path(7, value), source_s)
    separation = 1.0 - _smooth(.10, .88, clamped)
    duplicate.location += Vector((0.0, -.25 * separation, .10 * separation))
    fade = (_smooth(0, .14, clamped) * (1 - _smooth(.72, 1, clamped))) if visible else 0.0
    normalized = _smooth(.44, .56, source_s)
    duplicate.scale = (fade * _mix(1, .30 / duplicate['base_length'], normalized),
                       fade * _mix(1, .13 / duplicate['base_width'], normalized), fade)

    # A later failed handoff follows the explicit buffer/retry arc and rejoins
    # the contract. The changing shape remains the same editable record group.
    retry = _PAYROLL['retry']
    u = (t - .50) / .30
    visible = 0.0 <= u <= 1.0
    clamped = max(0.0, min(1.0, u))
    _orient_on_path(retry, _retry_path, clamped)
    fade = (_smooth(0, .10, clamped) * (1 - _smooth(.90, 1, clamped))) if visible else 0.0
    retry.scale = (fade, fade, fade)

    for index, pin in enumerate(_PAYROLL['check_pins']):
        phase = (3 * t + index * .10) % 1.0
        pulse = math.sin(phase * 2 * math.pi) ** 8
        rest = Vector(pin['rest_location'])
        pin.location = rest + Vector((0, 0, pulse * .075))
    return {'phase': t, 'dynamic_objects': len(_PAYROLL['dynamic_objects'])}
