# MVP Implementation Plan & Asset Checklist

This document serves as the definitive checklist for the engineering team to build the Minimum Viable Product (MVP) of the AI Interior Visualization Kiosk.

## 1. Required Files & Assets (To Prepare)

The following assets must be collected, processed, and placed in the project repository (`/public/assets/` or an S3 bucket):

*   [x] **`floorplan_2bhk_deluxe.jpg`**: The primary 2BHK floorplan image (rooms clearly labeled: LR, MBR, BR, KIT).
*   [x] **`floorplate_typical.jpg`**: The full-floor layout image.
*   [ ] **`floorplan_2bhk_deluxe_mask.svg`** (or PNG): The traced geometry mask for the 2BHK. *Note: One mask per room is required for precise ControlNet rendering.*
*   [ ] **`sofa_medium.glb`**: Example 3D furniture model for the living room.
*   [ ] **`dining_table.glb`**: Example 3D furniture model for the dining area.
*   [x] **`materials.json`**: The predefined material palette JSON (see structure below).
*   [ ] **Branding Assets**:
    *   `logo.svg` / `logo.png`
    *   `hero_loop.mp4` (Ambient background video for the kiosk idle screen).

### `materials.json` Structure
```json
{
  "modern-warm": {
    "floor": "oak_oiled",
    "wall": "matte_beige",
    "metal": "brushed_brass"
  },
  "dark-masculine": {
    "floor": "dark_walnut",
    "wall": "charcoal_matte",
    "metal": "gunmetal"
  },
  "light-scandi": {
    "floor": "light_ash",
    "wall": "pure_white",
    "metal": "matte_black"
  }
}
```

---

## 2. MVP Feature Implementation Order

Engineers must implement features strictly in this order to ensure a stable foundation before adding complex integrations.

### Phase 1: Core 3D Foundation
1.  **Floorplan Trace → Geometry (GLB):** Convert the 2D floorplan (`floorplan_2bhk_deluxe.jpg`) into a locked 3D geometry file (`unit_geom.glb`).
2.  **Three.js Viewer:** Implement the React Three Fiber viewer (`SpatialViewer.tsx`) to load `unit_geom.glb`.
3.  **Camera & Materials:** Add predefined camera anchors (e.g., `LR_CAM_01`) and implement the logic to swap materials on specific meshes based on `materials.json`.

### Phase 2: AI Rendering (Mocked for MVP)
4.  **Simple ML Endpoint:** Create the `/api/render` endpoint.
    *   *MVP Shortcut:* Instead of running live GPU inference immediately, this endpoint should accept the structured JSON prompt and return **pre-seeded example renders** (static images stored in S3) based on the requested style. This unblocks frontend development and allows for immediate stakeholder demos.

### Phase 3: Conversion & Sharing
5.  **Save Design Session (DB):** Implement the PostgreSQL schema (`design_session`) to track user choices (style, budget, unit).
6.  **Lead Capture Modal:** Build the premium UI modal (Name, Phone, Email, Visit Time, Budget) that triggers *after* the user saves their design.
7.  **WhatsApp Share:** Implement a deep link (`wa.me`) to share the generated render URL.
8.  **PDF Auto-Generate:** Create a simple server-side function (e.g., using `puppeteer` or `pdfkit`) to generate a branded PDF containing the user's selected render, floorplan, and estimated cost, which is emailed or downloaded upon lead capture.
