"""Product-viz props for the Marena Cutz stage. Original meshes, CC0."""

import math
import os

import bpy
import bmesh
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "models")
os.makedirs(OUT, exist_ok=True)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def principled(name, color, metallic, roughness, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def link(obj):
    bpy.context.collection.objects.link(obj)
    return obj


def mesh_object(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return link(bpy.data.objects.new(name, me))


def shade_smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True


def apply_modifiers(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for mod in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.select_set(False)


def bevel_subsurf(obj, width, segments=2, levels=2):
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = width
    bev.segments = segments
    bev.limit_method = "ANGLE"
    bev.angle_limit = math.radians(40)
    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = levels
    sub.render_levels = levels
    apply_modifiers(obj)
    shade_smooth(obj)


def assign(obj, mat):
    obj.data.materials.append(mat)


def cylinder(name, radius, depth, verts=48, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=radius, depth=depth, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    return obj


def cube(name, size, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return obj


def torus(name, major, minor, major_seg=48, minor_seg=16, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=major_seg,
        minor_segments=minor_seg,
        major_radius=major,
        minor_radius=minor,
        location=location,
    )
    obj = bpy.context.active_object
    obj.name = name
    return obj


def export_selected(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_image_format="JPEG",
        export_jpeg_quality=84,
    )
    print("exported", path, os.path.getsize(path))


def select_only(objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]


# ---------------------------------------------------------------------------
# Scissors — two tapered blades, pivot screw, finger rings
# ---------------------------------------------------------------------------

def build_blade_profile():
    """Outline of one shear: rings sit at the origin end, point at +Y."""
    bm = bmesh.new()
    steps = 40
    outer = []
    inner = []
    for i in range(steps):
        t = i / (steps - 1)
        y = -0.028 + t * 0.188
        # Handle is wider; blade tapers to a point and bows slightly.
        if t < 0.22:
            w = 0.011
            bow = 0
        else:
            u = (t - 0.22) / 0.78
            w = 0.013 * (1 - u) ** 1.15 + 0.0006
            bow = 0.004 * math.sin(u * math.pi)
        outer.append((bow + w, y, 0))
        inner.append((bow - w * 0.35, y, 0))
    verts = [bm.verts.new(p) for p in outer + list(reversed(inner))]
    bm.faces.new(verts)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_object("Blade", bm)


def build_scissors():
    reset()
    steel = principled("ShearSteel", (0.72, 0.73, 0.75), 1.0, 0.16)
    screw_metal = principled("Screw", (0.86, 0.62, 0.42), 1.0, 0.22)

    blades = []
    for index, angle in enumerate((-0.16, 0.16)):
        blade = build_blade_profile()
        solid = blade.modifiers.new("Solidify", "SOLIDIFY")
        solid.thickness = 0.0024
        solid.offset = 0
        bevel_subsurf(blade, 0.00035, segments=2, levels=1)
        assign(blade, steel)
        blade.rotation_euler[2] = angle
        blade.location.z = index * 0.0026
        blades.append(blade)

        # Finger ring
        ring = torus(
            f"Ring{index}",
            major=0.016,
            minor=0.0026,
            location=(0.0, -0.046, index * 0.0026),
        )
        ring.rotation_euler[0] = math.pi / 2
        assign(ring, steel)
        shade_smooth(ring)
        blades.append(ring)

        # Shank between ring and pivot
        shank = cylinder(
            f"Shank{index}",
            radius=0.0032,
            depth=0.028,
            verts=24,
            location=(0, -0.022, index * 0.0026),
        )
        shank.rotation_euler[0] = math.pi / 2
        assign(shank, steel)
        shade_smooth(shank)
        blades.append(shank)

    pivot = cylinder("Pivot", 0.0055, 0.008, verts=32, location=(0, 0.012, 0.003))
    assign(pivot, screw_metal)
    shade_smooth(pivot)
    slot = cube("Slot", (0.007, 0.0012, 0.001), location=(0, 0.012, 0.0072))
    assign(slot, screw_metal)
    blades.extend([pivot, slot])

    select_only(blades)
    export_selected(os.path.join(OUT, "scissors.glb"))


# ---------------------------------------------------------------------------
# Clipper — body, toothed blade, taper lever, switch, cord
# ---------------------------------------------------------------------------

def build_clipper():
    reset()
    body_mat = principled("ClipperBody", (0.09, 0.09, 0.1), 0.15, 0.38)
    peach = principled("PeachAccent", (1.0, 0.71, 0.55), 0.0, 0.35)
    blade_mat = principled("BladeSteel", (0.78, 0.79, 0.8), 1.0, 0.2)
    rubber = principled("Grip", (0.02, 0.02, 0.022), 0.0, 0.72)
    cord_mat = principled("Cord", (0.04, 0.04, 0.045), 0.0, 0.55)

    parts = []

    body = cube("Body", (0.042, 0.115, 0.038), location=(0, 0, 0))
    # Taper the nose by scaling the front verts
    bm = bmesh.new()
    bm.from_mesh(body.data)
    for v in bm.verts:
        if v.co.y > 0.03:
            t = (v.co.y - 0.03) / 0.0275
            v.co.x *= 1 - 0.28 * t
            v.co.z *= 1 - 0.18 * t
            v.co.z -= 0.004 * t
    bm.to_mesh(body.data)
    bm.free()
    bevel_subsurf(body, 0.004, segments=3, levels=2)
    assign(body, body_mat)
    parts.append(body)

    grip = cube("Grip", (0.036, 0.04, 0.006), location=(0, -0.02, 0.02))
    bevel_subsurf(grip, 0.0015, segments=2, levels=1)
    assign(grip, rubber)
    parts.append(grip)

    stripe = cube("Stripe", (0.008, 0.07, 0.003), location=(0.02, -0.005, 0.0))
    bevel_subsurf(stripe, 0.0008, segments=1, levels=1)
    assign(stripe, peach)
    parts.append(stripe)

    # Fixed and moving blades
    for name, z in (("BladeFixed", -0.02), ("BladeCutter", -0.0175)):
        blade = cube(name, (0.04, 0.028, 0.0035), location=(0, 0.068, z))
        bevel_subsurf(blade, 0.0006, segments=1, levels=1)
        assign(blade, blade_mat)
        parts.append(blade)

    teeth = []
    tooth_count = 22
    for i in range(tooth_count):
        x = -0.018 + (0.036 * i / (tooth_count - 1))
        tooth = cube(f"Tooth{i}", (0.0015, 0.007, 0.0022), location=(x, 0.084, -0.018))
        assign(tooth, blade_mat)
        teeth.append(tooth)
    parts.extend(teeth)

    # Taper lever on the left side
    lever = cube("TaperLever", (0.004, 0.022, 0.01), location=(-0.024, 0.02, 0.004))
    lever.rotation_euler[1] = math.radians(18)
    bevel_subsurf(lever, 0.001, segments=2, levels=1)
    assign(lever, blade_mat)
    parts.append(lever)
    knob = cylinder("LeverKnob", 0.0045, 0.004, verts=24, location=(-0.03, 0.028, 0.008))
    knob.rotation_euler[1] = math.pi / 2
    assign(knob, peach)
    shade_smooth(knob)
    parts.append(knob)

    # Power switch
    switch = cube("Switch", (0.01, 0.016, 0.004), location=(0.0, -0.03, 0.022))
    bevel_subsurf(switch, 0.001, segments=2, levels=1)
    assign(switch, peach)
    parts.append(switch)

    # Cord leaving the heel
    curve_data = bpy.data.curves.new("Cord", "CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = 12
    curve_data.bevel_depth = 0.0032
    curve_data.bevel_resolution = 4
    spline = curve_data.splines.new("BEZIER")
    spline.bezier_points.add(3)
    pts = [(-0.0, -0.06, 0.0), (0.0, -0.09, -0.01), (0.03, -0.12, -0.03), (0.06, -0.16, -0.02)]
    for point, co in zip(spline.bezier_points, pts):
        point.co = Vector(co)
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    cord = link(bpy.data.objects.new("Cord", curve_data))
    assign(cord, cord_mat)
    parts.append(cord)

    select_only(parts)
    export_selected(os.path.join(OUT, "clipper.glb"))


# ---------------------------------------------------------------------------
# Modern shop chair — chrome hydraulic base, black padded seat, headrest
# Matches the Kasernenstrasse stations: round footrest, pedestal, headrest.
# ---------------------------------------------------------------------------

def build_chair():
    reset()
    chrome = principled("Chrome", (0.78, 0.79, 0.81), 1.0, 0.16)
    leather = principled("Leather", (0.015, 0.014, 0.013), 0.0, 0.46)
    stitch = principled("Stitch", (0.08, 0.07, 0.06), 0.0, 0.6)
    peach = principled("PeachPiping", (1.0, 0.48, 0.0), 0.05, 0.4)

    parts = []

    base = cylinder("Base", 0.06, 0.035, verts=64, location=(0, 0, 0.04))
    assign(base, chrome)
    shade_smooth(base)
    parts.append(base)

    # Five-spoke hydraulic base with casters, plus a round barber foot ring.
    for i in range(5):
        ang = i * math.tau / 5
        spoke = cylinder("Spoke", 0.012, 0.42, verts=20, location=(0, 0, 0.055))
        spoke.rotation_euler = (0, math.pi / 2, ang)
        spoke.location = (math.cos(ang) * 0.16, math.sin(ang) * 0.16, 0.055)
        assign(spoke, chrome)
        shade_smooth(spoke)
        parts.append(spoke)
        caster = cylinder(
            "Caster",
            0.018,
            0.028,
            verts=20,
            location=(math.cos(ang) * 0.32, math.sin(ang) * 0.32, 0.03),
        )
        assign(caster, chrome)
        shade_smooth(caster)
        parts.append(caster)

    column = cylinder("Column", 0.038, 0.42, verts=40, location=(0, 0, 0.28))
    assign(column, chrome)
    shade_smooth(column)
    parts.append(column)

    ring = torus("FootRing", 0.24, 0.011, 64, 16, location=(0, 0, 0.2))
    ring.rotation_euler[0] = math.pi / 2
    assign(ring, chrome)
    shade_smooth(ring)
    parts.append(ring)

    # Four chrome struts holding the foot ring
    for i in range(4):
        ang = i * math.tau / 4 + 0.4
        strut = cylinder("Strut", 0.006, 0.16, verts=12, location=(0, 0, 0.2))
        strut.rotation_euler = (0, math.pi / 2, ang)
        strut.location = (math.cos(ang) * 0.1, math.sin(ang) * 0.1, 0.2)
        assign(strut, chrome)
        shade_smooth(strut)
        parts.append(strut)

    seat = cube("Seat", (0.5, 0.5, 0.1), location=(0, -0.02, 0.54))
    bevel_subsurf(seat, 0.035, segments=4, levels=2)
    assign(seat, leather)
    parts.append(seat)

    back = cube("Back", (0.42, 0.08, 0.48), location=(0, -0.22, 0.9))
    back.rotation_euler[0] = math.radians(-8)
    bevel_subsurf(back, 0.028, segments=3, levels=2)
    assign(back, leather)
    parts.append(back)

    post = cylinder("HeadPost", 0.012, 0.16, verts=20, location=(0, -0.2, 1.18))
    assign(post, chrome)
    shade_smooth(post)
    parts.append(post)

    headrest = cube("Headrest", (0.22, 0.06, 0.1), location=(0, -0.16, 1.26))
    bevel_subsurf(headrest, 0.018, segments=3, levels=2)
    assign(headrest, leather)
    parts.append(headrest)

    piping = cube("Piping", (0.23, 0.008, 0.012), location=(0, -0.125, 1.26))
    assign(piping, peach)
    parts.append(piping)

    for side in (-1, 1):
        arm_post = cylinder(
            "ArmPost",
            0.012,
            0.22,
            verts=16,
            location=(side * 0.26, -0.02, 0.66),
        )
        assign(arm_post, chrome)
        shade_smooth(arm_post)
        parts.append(arm_post)
        pad = cube(
            "ArmPad",
            (0.08, 0.28, 0.03),
            location=(side * 0.26, 0.0, 0.76),
        )
        bevel_subsurf(pad, 0.01, segments=2, levels=1)
        assign(pad, leather)
        parts.append(pad)

    pump = cylinder("Pump", 0.008, 0.16, verts=16, location=(0.12, 0.16, 0.48))
    pump.rotation_euler[0] = math.radians(70)
    assign(pump, chrome)
    shade_smooth(pump)
    parts.append(pump)

    select_only(parts)
    export_selected(os.path.join(OUT, "chair.glb"))


def optimize_head():
    reset()
    src = "/tmp/assets/head.glb"
    bpy.ops.import_scene.gltf(filepath=src)
    for image in bpy.data.images:
        if image.size[0] > 2048:
            image.scale(2048, 2048)
        elif image.size[0] > 1024:
            image.scale(1024, 1024)
    # Nose direction: vertex farthest from the centroid in the upper head.
    mesh_obj = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")
    verts = [mesh_obj.matrix_world @ v.co for v in mesh_obj.data.vertices]
    center = sum(verts, Vector()) / len(verts)
    upper = [v for v in verts if v.z > center.z]
    nose = max(upper, key=lambda v: (v - center).length)
    print("HEAD center", tuple(round(c, 4) for c in center))
    print("HEAD nose-ish", tuple(round(c, 4) for c in nose))
    print("HEAD dims", tuple(round(c, 4) for c in mesh_obj.dimensions))
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    select_only(objects)
    export_selected(os.path.join(OUT, "head.glb"))


if __name__ == "__main__":
    build_scissors()
    build_clipper()
    build_chair()
    optimize_head()
