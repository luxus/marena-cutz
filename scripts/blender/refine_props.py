"""Second pass: shears with cut finger rings, a lofted clipper, scan-head normals."""

import math
import os

import bpy
import bmesh
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "models")


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def principled(name, color, metallic, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def link_mesh(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)
    return obj


def shade_smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True


def apply_mods(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for mod in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.select_set(False)


def export_selected(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
    )
    print("exported", path, os.path.getsize(path))


def select_only(objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]


def rounded_ring(z, half_w, half_h, segs=8):
    pts = []
    for i in range(segs):
        a = (i / segs) * math.tau
        pts.append(Vector((math.cos(a) * half_w, z, math.sin(a) * half_h)))
    return pts


def loft(name, sections):
    """sections: list of (z, half_w, half_h) along Y stored in Vector.y."""
    bm = bmesh.new()
    rings = []
    for z, half_w, half_h in sections:
        ring = []
        for i in range(12):
            a = (i / 12) * math.tau
            # Squircle-ish so the body is not a capsule.
            c = math.cos(a)
            s = math.sin(a)
            ring.append(bm.verts.new((c * half_w, z, s * half_h)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(len(a)):
            j = (i + 1) % len(a)
            bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.faces.new(rings[0])
    bm.faces.new(list(reversed(rings[-1])))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return link_mesh(name, bm)


def build_scissors():
    reset()
    steel = principled("ShearSteel", (0.74, 0.75, 0.77), 1.0, 0.14)
    brass = principled("PivotBrass", (0.83, 0.58, 0.32), 1.0, 0.24)
    parts = []

    for index, spin in enumerate((-0.22, 0.22)):
        bm = bmesh.new()
        steps = 36
        left = []
        right = []
        for i in range(steps):
            t = i / (steps - 1)
            y = 0.012 + t * 0.168
            width = 0.0115 * ((1 - t) ** 1.35) + 0.00045
            bow = 0.007 * math.sin(t * math.pi * 0.9)
            left.append(bm.verts.new((bow - width, y, 0)))
            right.append(bm.verts.new((bow + width * 0.25, y, 0)))
        bm.faces.new(left + list(reversed(right)))
        blade = link_mesh(f"Blade{index}", bm)
        solid = blade.modifiers.new("Solid", "SOLIDIFY")
        solid.thickness = 0.0017
        bev = blade.modifiers.new("Bevel", "BEVEL")
        bev.width = 0.00025
        bev.segments = 2
        apply_mods(blade)
        shade_smooth(blade)
        blade.data.materials.append(steel)

        # Handle plate with two cut rings — one shear half, not floating tori.
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.038, 0))
        plate = bpy.context.active_object
        plate.name = f"Plate{index}"
        plate.scale = (0.016, 0.058, 0.0015)
        bpy.ops.object.transform_apply(scale=True)
        bev = plate.modifiers.new("Bevel", "BEVEL")
        bev.width = 0.003
        bev.segments = 4
        apply_mods(plate)

        holes = []
        for name, y, radius in ((f"HoleA{index}", -0.02, 0.009), (f"HoleB{index}", -0.052, 0.011)):
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=40, radius=radius, depth=0.02, location=(0, y, 0)
            )
            hole = bpy.context.active_object
            hole.name = name
            holes.append(hole)
        diff = plate.modifiers.new("Holes", "BOOLEAN")
        diff.operation = "DIFFERENCE"
        diff.object = holes[0]
        apply_mods(plate)
        diff = plate.modifiers.new("Holes2", "BOOLEAN")
        diff.operation = "DIFFERENCE"
        diff.object = holes[1]
        apply_mods(plate)
        for hole in holes:
            bpy.data.objects.remove(hole, do_unlink=True)
        shade_smooth(plate)
        plate.data.materials.append(steel)

        for obj in (blade, plate):
            obj.rotation_euler[2] = spin
            obj.location.z = (index - 0.5) * 0.0022
        parts.extend([blade, plate])

    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.0048, depth=0.007, location=(0, 0.012, 0))
    screw = bpy.context.active_object
    screw.name = "Screw"
    screw.data.materials.append(brass)
    shade_smooth(screw)
    parts.append(screw)

    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.0022, depth=0.0012, location=(0, 0.012, 0.0036))
    head = bpy.context.active_object
    head.name = "ScrewHead"
    head.data.materials.append(brass)
    shade_smooth(head)
    parts.append(head)

    select_only(parts)
    export_selected(os.path.join(OUT, "scissors.glb"))


def saw_blade(name, y, z, width, depth, tooth):
    bm = bmesh.new()
    n = 26
    back_y = y
    front = []
    for i in range(n + 1):
        x = -width / 2 + width * i / n
        tip = tooth if i % 2 else 0.0
        front.append(bm.verts.new((x, back_y + depth + tip, z)))
    back_l = bm.verts.new((-width / 2, back_y, z))
    back_r = bm.verts.new((width / 2, back_y, z))
    bm.faces.new([back_l, back_r] + list(reversed(front)))
    obj = link_mesh(name, bm)
    solid = obj.modifiers.new("Solid", "SOLIDIFY")
    solid.thickness = 0.0016
    apply_mods(obj)
    shade_smooth(obj)
    return obj


def build_clipper():
    reset()
    body_mat = principled("Body", (0.07, 0.072, 0.078), 0.35, 0.32)
    rubber = principled("Grip", (0.015, 0.015, 0.016), 0.0, 0.7)
    steel = principled("Steel", (0.8, 0.81, 0.82), 1.0, 0.18)
    peach = principled("Peach", (1.0, 0.48, 0.0), 0.1, 0.32)
    cord_mat = principled("Cord", (0.03, 0.03, 0.032), 0.0, 0.5)

    # y, half width, half height — motor housing to blade neck
    body = loft(
        "Body",
        [
            (-0.078, 0.02, 0.022),
            (-0.05, 0.024, 0.026),
            (-0.01, 0.022, 0.022),
            (0.03, 0.016, 0.014),
            (0.058, 0.02, 0.008),
        ],
    )
    bev = body.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.0012
    bev.segments = 2
    sub = body.modifiers.new("Sub", "SUBSURF")
    sub.levels = 1
    apply_mods(body)
    shade_smooth(body)
    body.data.materials.append(body_mat)

    grip = loft(
        "Grip",
        [
            (-0.04, 0.018, 0.004),
            (-0.01, 0.016, 0.003),
            (0.02, 0.012, 0.002),
        ],
    )
    grip.location.z = 0.02
    shade_smooth(grip)
    grip.data.materials.append(rubber)

    blade_bed = saw_blade("Blade", 0.05, -0.012, 0.046, 0.02, 0.0045)
    blade_bed.data.materials.append(steel)
    cutter = saw_blade("Cutter", 0.052, -0.0095, 0.044, 0.016, 0.0035)
    cutter.data.materials.append(steel)

    # Taper lever — a real side lever, not a cube stuck on.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.026, 0.01, 0.0))
    lever = bpy.context.active_object
    lever.scale = (0.003, 0.02, 0.008)
    lever.rotation_euler[1] = math.radians(28)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    bev = lever.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.001
    bev.segments = 2
    apply_mods(lever)
    shade_smooth(lever)
    lever.data.materials.append(steel)

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24, radius=0.004, depth=0.004, location=(-0.034, 0.02, 0.006)
    )
    knob = bpy.context.active_object
    knob.rotation_euler[1] = math.pi / 2
    shade_smooth(knob)
    knob.data.materials.append(peach)

    # Sliding power switch on the heel
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.0, -0.055, 0.024))
    switch = bpy.context.active_object
    switch.scale = (0.008, 0.014, 0.004)
    bpy.ops.object.transform_apply(scale=True)
    bev = switch.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.0012
    bev.segments = 3
    apply_mods(switch)
    shade_smooth(switch)
    switch.data.materials.append(peach)

    curve = bpy.data.curves.new("Cord", "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = 0.0028
    curve.bevel_resolution = 5
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(3)
    coords = [(0, -0.08, 0), (0.01, -0.11, -0.02), (0.04, -0.15, -0.015), (0.02, -0.2, 0.01)]
    for point, co in zip(spline.bezier_points, coords):
        point.co = Vector(co)
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    cord = bpy.data.objects.new("Cord", curve)
    bpy.context.collection.objects.link(cord)
    cord.data.materials.append(cord_mat)

    parts = [body, grip, blade_bed, cutter, lever, knob, switch, cord]
    select_only(parts)
    export_selected(os.path.join(OUT, "clipper.glb"))


def fix_head():
    reset()
    bpy.ops.import_scene.gltf(filepath=os.path.join(OUT, "head.glb"))
    for mat in bpy.data.materials:
        if not mat.node_tree:
            continue
        for node in mat.node_tree.nodes:
            if node.type == "NORMAL_MAP":
                node.inputs["Strength"].default_value = 1.0
            if node.type == "BSDF_PRINCIPLED":
                if "Roughness" in node.inputs:
                    node.inputs["Roughness"].default_value = 0.42
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    for obj in meshes:
        shade_smooth(obj)
    select_only(meshes)
    export_selected(os.path.join(OUT, "head.glb"))


if __name__ == "__main__":
    build_scissors()
    build_clipper()
    fix_head()
