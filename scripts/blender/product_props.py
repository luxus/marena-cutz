"""Product-viz shears, clipper, and shop chair. Original meshes, CC0."""

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


def metal(name, color, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def plastic(name, color, roughness, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def leather_material():
    mat = plastic("Leather", (0.012, 0.011, 0.01), 0.52)
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    tex = bpy.data.images.new("leather-normal", 256, 256)
    pixels = []
    for y in range(256):
        for x in range(256):
            n = ((x * 37 + y * 17) % 23) / 23
            pixels.extend((0.5 + n * 0.04, 0.5 + ((x * 13) % 11) / 11 * 0.04, 1.0, 1.0))
    tex.pixels.foreach_set(pixels) if False else tex.pixels.foreach_set(pixels)
    image_node = mat.node_tree.nodes.new("ShaderNodeTexImage")
    image_node.image = tex
    normal_node = mat.node_tree.nodes.new("ShaderNodeNormalMap")
    normal_node.inputs["Strength"].default_value = 0.35
    mat.node_tree.links.new(image_node.outputs["Color"], normal_node.inputs["Color"])
    mat.node_tree.links.new(normal_node.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def link(obj):
    bpy.context.collection.objects.link(obj)
    return obj


def smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True


def apply_mods(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for mod in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.select_set(False)


def finish(obj, mat, bevel=0.0, segments=2, levels=0):
    if bevel > 0:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = segments
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(35)
    if levels:
        sub = obj.modifiers.new("Sub", "SUBSURF")
        sub.levels = levels
        sub.render_levels = levels
    if bevel > 0 or levels:
        apply_mods(obj)
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    smooth(obj)
    return obj


def select_only(objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]


def export(objects, path):
    select_only(objects)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
    )
    print("exported", path, os.path.getsize(path))


def cylinder(name, radius, depth, verts, location):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=location)
    obj = bpy.context.active_object
    obj.name = name
    return obj


def box(name, size, location):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return obj


def blade_mesh(name):
    bm = bmesh.new()
    steps = 56
    left = []
    right = []
    for i in range(steps):
        t = i / (steps - 1)
        y = 0.018 + t * 0.162
        width = 0.014 * (1 - t) ** 1.25 + 0.00055
        bow = 0.008 * math.sin(t * math.pi * 0.85)
        left.append(bm.verts.new((bow - width, y, 0)))
        right.append(bm.verts.new((bow + width * 0.22, y, 0)))
    bm.faces.new(left + list(reversed(right)))
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    return link(bpy.data.objects.new(name, mesh))


def build_scissors():
    reset()
    steel = metal("ShearSteel", (0.78, 0.79, 0.81), 0.12)
    brass = metal("Pivot", (0.86, 0.58, 0.28), 0.22)
    parts = []

    for index, angle in enumerate((-0.18, 0.18)):
        blade = blade_mesh(f"Blade{index}")
        solid = blade.modifiers.new("Solid", "SOLIDIFY")
        solid.thickness = 0.0022
        solid.offset = 0
        finish(blade, steel, bevel=0.00035, segments=2, levels=1)
        blade.rotation_euler[2] = angle
        blade.location.z = (index - 0.5) * 0.0024
        parts.append(blade)

        for name, major, y, z_bias in (
            (f"Finger{index}", 0.0175, -0.028, 0),
            (f"Thumb{index}", 0.0135, -0.064, 0.004),
        ):
            bpy.ops.mesh.primitive_torus_add(
                major_segments=72,
                minor_segments=18,
                major_radius=major,
                minor_radius=0.0027,
                location=(0.0, y, z_bias + (index - 0.5) * 0.0024),
            )
            ring = bpy.context.active_object
            ring.name = name
            ring.rotation_euler[2] = angle
            finish(ring, steel)
            parts.append(ring)

        shank = cylinder(
            f"Shank{index}",
            0.0034,
            0.055,
            28,
            (0, -0.02, (index - 0.5) * 0.0024),
        )
        shank.rotation_euler[0] = math.pi / 2
        shank.rotation_euler[2] = angle
        finish(shank, steel)
        parts.append(shank)

    screw = cylinder("Screw", 0.0052, 0.008, 36, (0, 0.016, 0.003))
    finish(screw, brass)
    parts.append(screw)
    cap = cylinder("ScrewCap", 0.0072, 0.0014, 36, (0, 0.016, 0.0072))
    finish(cap, brass)
    parts.append(cap)
    slot = box("Slot", (0.009, 0.0011, 0.0008), (0, 0.016, 0.008))
    finish(slot, metal("Slot", (0.2, 0.16, 0.1), 0.4))
    parts.append(slot)

    export(parts, os.path.join(OUT, "scissors.glb"))


def saw_plate(name, y, z, width, depth, tooth, thickness):
    bm = bmesh.new()
    count = 46
    front = []
    for i in range(count + 1):
        x = -width / 2 + width * i / count
        tip = tooth if i % 2 == 0 else 0.0
        front.append(bm.verts.new((x, y + depth + tip, z)))
    back_l = bm.verts.new((-width / 2, y, z))
    back_r = bm.verts.new((width / 2, y, z))
    bm.faces.new([back_l, back_r, *reversed(front)])
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = link(bpy.data.objects.new(name, mesh))
    solid = obj.modifiers.new("Solid", "SOLIDIFY")
    solid.thickness = thickness
    apply_mods(obj)
    return obj


def build_clipper():
    reset()
    housing = plastic("Housing", (0.045, 0.047, 0.05), 0.34, 0.08)
    rubber = plastic("Grip", (0.012, 0.012, 0.013), 0.72)
    steel = metal("BladeSteel", (0.82, 0.83, 0.85), 0.16)
    peach = plastic("Peach", (1.0, 0.48, 0.0), 0.28, 0.05)
    cord_mat = plastic("Cord", (0.02, 0.02, 0.022), 0.55)

    body = box("Body", (0.046, 0.132, 0.038), (0, -0.01, 0))
    bm = bmesh.new()
    bm.from_mesh(body.data)
    for vert in bm.verts:
        if vert.co.y > 0.03:
            t = (vert.co.y - 0.03) / 0.036
            vert.co.x *= 1 - 0.22 * t
            vert.co.z *= 1 - 0.35 * t
    bm.to_mesh(body.data)
    bm.free()
    finish(body, housing, bevel=0.0032, segments=3, levels=1)

    grip = box("Grip", (0.034, 0.055, 0.004), (0, -0.02, 0.018))
    finish(grip, rubber, bevel=0.0016, segments=2, levels=1)

    stripe = box("Stripe", (0.006, 0.07, 0.003), (0.022, -0.015, 0))
    finish(stripe, peach, bevel=0.0008, segments=1)

    fixed = saw_plate("FixedBlade", 0.048, -0.016, 0.052, 0.016, 0.0032, 0.002)
    finish(fixed, steel)
    cutter = saw_plate("Cutter", 0.05, -0.0132, 0.049, 0.013, 0.0024, 0.0014)
    finish(cutter, steel)

    lever = box("TaperLever", (0.006, 0.028, 0.012), (-0.028, 0.012, 0.002))
    lever.rotation_euler[1] = math.radians(22)
    bpy.ops.object.transform_apply(rotation=True)
    finish(lever, steel, bevel=0.0012, segments=2, levels=1)

    knob = cylinder("LeverWheel", 0.0055, 0.004, 28, (-0.036, 0.022, 0.008))
    knob.rotation_euler[1] = math.pi / 2
    finish(knob, peach)

    switch = box("Switch", (0.01, 0.018, 0.005), (0.0, -0.048, 0.02))
    finish(switch, peach, bevel=0.0014, segments=3, levels=1)

    curve = bpy.data.curves.new("Cord", "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = 0.0034
    curve.bevel_resolution = 6
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(3)
    for point, co in zip(
        spline.bezier_points,
        [(0, -0.078, -0.004), (0.01, -0.11, -0.02), (0.035, -0.15, -0.01), (0.02, -0.2, 0.02)],
    ):
        point.co = Vector(co)
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    cord = link(bpy.data.objects.new("Cord", curve))
    cord.data.materials.append(cord_mat)

    parts = [body, grip, stripe, fixed, cutter, lever, knob, switch, cord]
    export(parts, os.path.join(OUT, "clipper.glb"))


def build_chair():
    reset()
    chrome = metal("Chrome", (0.82, 0.83, 0.86), 0.08)
    hide = leather_material()
    peach = plastic("Piping", (1.0, 0.45, 0.0), 0.35)
    parts = []

    base = cylinder("Base", 0.23, 0.045, 72, (0, 0, 0.04))
    finish(base, chrome)
    parts.append(base)
    skirt = cylinder("Skirt", 0.16, 0.08, 64, (0, 0, 0.09))
    finish(skirt, chrome)
    parts.append(skirt)

    column = cylinder("Column", 0.04, 0.38, 48, (0, 0, 0.3))
    finish(column, chrome)
    parts.append(column)
    collar = cylinder("Collar", 0.055, 0.03, 40, (0, 0, 0.48))
    finish(collar, chrome)
    parts.append(collar)

    ring = bpy.ops.mesh.primitive_torus_add(
        major_segments=80,
        minor_segments=20,
        major_radius=0.25,
        minor_radius=0.012,
        location=(0, 0, 0.2),
    )
    foot = bpy.context.active_object
    foot.name = "FootRing"
    foot.rotation_euler[0] = math.pi / 2
    finish(foot, chrome)
    parts.append(foot)

    for i in range(4):
        ang = i * math.tau / 4 + 0.4
        strut = cylinder("Strut", 0.007, 0.18, 16, (0, 0, 0.2))
        strut.rotation_euler = (0, math.pi / 2, ang)
        strut.location = (math.cos(ang) * 0.11, math.sin(ang) * 0.11, 0.2)
        finish(strut, chrome)
        parts.append(strut)

    seat = box("Seat", (0.52, 0.5, 0.12), (0, 0.0, 0.58))
    finish(seat, hide, bevel=0.04, segments=5, levels=2)
    parts.append(seat)

    back = box("Back", (0.46, 0.09, 0.5), (0, -0.22, 0.92))
    back.rotation_euler[0] = math.radians(-7)
    bpy.context.view_layer.objects.active = back
    bpy.ops.object.transform_apply(rotation=True)
    finish(back, hide, bevel=0.03, segments=4, levels=2)
    parts.append(back)

    post = cylinder("HeadPost", 0.012, 0.18, 24, (0, -0.2, 1.2))
    finish(post, chrome)
    parts.append(post)
    rest = box("Headrest", (0.24, 0.07, 0.11), (0, -0.16, 1.28))
    finish(rest, hide, bevel=0.02, segments=3, levels=2)
    parts.append(rest)
    pipe = box("Piping", (0.25, 0.008, 0.012), (0, -0.125, 1.28))
    finish(pipe, peach)
    parts.append(pipe)

    for side in (-1, 1):
        post_arm = cylinder("ArmPost", 0.013, 0.24, 20, (side * 0.28, -0.02, 0.68))
        finish(post_arm, chrome)
        parts.append(post_arm)
        pad = box("ArmPad", (0.08, 0.32, 0.035), (side * 0.28, 0.02, 0.8))
        finish(pad, hide, bevel=0.012, segments=3, levels=1)
        parts.append(pad)

    pump = cylinder("Pump", 0.009, 0.18, 20, (0.16, 0.18, 0.5))
    pump.rotation_euler[0] = math.radians(68)
    finish(pump, chrome)
    parts.append(pump)

    export(parts, os.path.join(OUT, "chair.glb"))


if __name__ == "__main__":
    build_scissors()
    build_clipper()
    build_chair()
