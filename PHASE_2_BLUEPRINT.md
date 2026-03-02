# PHASE 2 — Spatial Constrained Rendering Blueprint

This document outlines the technical plan for converting a 2D floorplan into a 3D model, setting up camera anchors, handling textures, ensuring safety, and optimizing performance.

## 1. Floorplan Conversion Pipeline (Image -> SVG -> GLB)

This process converts a raster floorplan image into a clean, extruded 3D geometry suitable for web rendering.

### Prerequisites (Local Machine)
- **ImageMagick**: For image pre-processing (`brew install imagemagick` or `apt install imagemagick`).
- **Potrace**: For tracing bitmaps to vector graphics (`brew install potrace` or `apt install potrace`).
- **Blender**: For 3D modeling and extrusion (`brew install blender` or download from blender.org). Ensure `blender` is in your PATH.

### Step-by-Step Commands

#### Step 1: Pre-process Image (High Contrast)
Convert the floorplan to a high-contrast black-and-white bitmap (PBM format) to improve tracing accuracy.
```bash
# Convert to grayscale, threshold to binary, remove noise
convert floorplan_2bhk_deluxe.jpg -colorspace gray -threshold 50% -negate floorplan_bw.pbm
```

#### Step 2: Trace to SVG
Use `potrace` to trace the bitmap into a scalable vector graphic.
```bash
# Trace the bitmap to SVG
potrace floorplan_bw.pbm -s -o floorplan_traced.svg
```

#### Step 3: Extrude Geometry (Blender Script)
Use a Blender Python script to import the SVG, extrude the curves, and export as GLB.

Create a file named `extrude_floorplan.py`:
```python
import bpy
import sys

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Import SVG
svg_path = sys.argv[-2]
bpy.ops.import_curve.svg(filepath=svg_path)

# Select all imported curves
curves = [obj for obj in bpy.context.scene.objects if obj.type == 'CURVE']

# Extrude and Convert to Mesh
for curve in curves:
    curve.select_set(True)
    curve.data.extrude = 0.05  # Extrude height (e.g., 2.5m scaled down)
    
    # Rename based on simple heuristics (optional)
    # e.g., if area is large -> Floor, if thin -> Wall
    # For now, we name them Generic_Mesh for manual tagging later
    curve.name = f"Extruded_{curve.name}"

# Join all curves into one mesh (optional, or keep separate for material assignment)
# bpy.ops.object.join()

# Export to GLB
output_path = sys.argv[-1]
bpy.ops.export_scene.gltf(filepath=output_path)
```

Run the script:
```bash
blender --background --python extrude_floorplan.py -- floorplan_traced.svg unit_geom.glb
```

## 2. Camera Anchor Definition

Camera anchors are predefined positions and targets for the camera to "teleport" to. This ensures the user always views the room from an optimal angle.

**File:** `public/data/camera_anchors.json`
```json
[
  {
    "id": "living_room_main",
    "name": "Living Room",
    "position": [0, 1.5, 5],
    "target": [0, 1, 0],
    "fov": 45
  },
  {
    "id": "kitchen_view",
    "name": "Kitchen",
    "position": [3, 1.5, 2],
    "target": [3, 1, -2],
    "fov": 50
  }
]
```

## 3. Texture Pipeline & AI Material Swapping

We use a hybrid approach:
1.  **Base Materials:** A curated library of high-quality PBR textures (wood, concrete, marble) stored in `public/textures/`.
2.  **AI Textures:** Generated on-demand using Stable Diffusion (or similar API). The AI generates a seamless tileable texture map (albedo). We then generate normal/roughness maps using a lightweight client-side or server-side heuristic (e.g., deriving normal map from grayscale height estimation).

**Pipeline:**
1.  User selects a surface (e.g., "Floor").
2.  User inputs prompt: "Rustic oak wood with scratches".
3.  App calls AI generation API.
4.  API returns a URL to the generated texture.
5.  App loads texture -> `TextureLoader` -> Applies to material.

## 4. Safety & Locking

To prevent users from breaking the model (e.g., deleting walls), we use a strict naming convention and raycasting filter.

*   **Locked Meshes:** Names starting with `Wall_`, `Window_`, `Structure_`.
*   **Editable Meshes:** Names starting with `Floor_`, `Decor_`, `Furniture_`.

**Implementation:**
In the `onPointerDown` handler:
```typescript
const handleClick = (e) => {
  const meshName = e.object.name;
  if (meshName.startsWith('Wall_') || meshName.startsWith('Window_')) {
    console.warn("This element is locked.");
    return;
  }
  // Proceed with selection
  setSelectedMesh(e.object);
};
```

## 5. Performance Plan

*   **LODs (Level of Detail):** Use `gltf-transform` to generate simplified versions of complex furniture meshes.
*   **Texture Compression:** Use WebP or KTX2 for textures to reduce download size.
*   **Lazy Loading:** Only load high-res textures for the current room. Use placeholders (tiny blurhashes) for others.
*   **Instancing:** If the floorplan has 50 identical chairs, use `InstancedMesh` to render them with a single draw call.
