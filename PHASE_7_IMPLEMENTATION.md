# PHASE 7 — Frontend & Rendering Implementation (Developer-Ready)

This document provides the technical implementation details for the 3D rendering pipeline, API contracts, and prompt normalization examples.

## 1. User-to-Structured Prompt Examples

These examples demonstrate how raw user input is normalized into the structured JSON required by the ML rendering engine.

### Example 1: The Minimalist
**User Input:** "Make the living room feel like a minimal, bright Scandinavian space. Keep it cheap."
**Structured JSON:**
```json
{
 "unit_id": "2BHK_DELUXE_02",
 "room": "Living Room",
 "facing": "east-morning",
 "style": "light-scandi",
 "materials": ["light_ash_wood", "white_matte", "pale_grey_fabric"],
 "furniture_density": "low",
 "budget_tier": "standard",
 "constraints": ["lock_walls", "clear_0.9m_circulation"],
 "camera": "LR_CAM_01",
 "deliverables": ["render_4096", "albedo", "roughness", "equirect360"]
}
```

### Example 2: The Luxury Buyer
**User Input:** "I want a dark, moody master bedroom with brass accents and high-end finishes."
**Structured JSON:**
```json
{
 "unit_id": "2BHK_DELUXE_02",
 "room": "Master Bedroom",
 "facing": "west-evening",
 "style": "dark-masculine",
 "materials": ["dark_walnut", "brushed_brass", "charcoal_velvet"],
 "furniture_density": "medium",
 "budget_tier": "signature",
 "constraints": ["lock_walls", "clear_0.9m_circulation"],
 "camera": "MBR_CAM_01",
 "deliverables": ["render_4096", "albedo", "roughness", "equirect360"]
}
```

### Example 3: The Practical Family
**User Input:** "We need a warm, modern kitchen with lots of storage and durable surfaces."
**Structured JSON:**
```json
{
 "unit_id": "2BHK_DELUXE_02",
 "room": "Kitchen",
 "facing": "south-midday",
 "style": "modern-warm",
 "materials": ["quartz_countertop", "oak_veneer", "matte_black_hardware"],
 "furniture_density": "high",
 "budget_tier": "premium",
 "constraints": ["lock_walls", "clear_0.9m_circulation"],
 "camera": "KIT_CAM_01",
 "deliverables": ["render_4096", "albedo", "roughness", "equirect360"]
}
```

---

## 2. Production Stack

*   **Frontend:** React + Next.js 15 (App Router, SSR where needed)
*   **3D Engine:** Three.js + react-three-fiber + Drei (for helpers and camera controls)
*   **Backend API:** Node.js (Next.js API Routes) + FastAPI (for ML endpoints)
*   **Database:** PostgreSQL (Neon) for sessions/leads; Redis (ElastiCache) for caching pre-rendered assets
*   **Storage:** Amazon S3 (or Cloudflare R2) for GLB models, generated textures, and renders
*   **ML Runtime:** Containerized inference (GPU via Modal.com/SageMaker) running a tuned text-to-interior model (Stable Diffusion XL + ControlNet + Inpainting)
*   **Viewer:** React Three Fiber equirectangular sphere for 360 views, with embedded camera anchors.

---

## 3. Key Implementation Snippets

### A. Three.js Loader + Material Swap (React Three Fiber)

```tsx
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function RoomModel({ modelUrl, floorTextureUrl }) {
  // Load the locked geometry
  const { scene } = useGLTF(modelUrl);
  
  // Load the AI-generated texture
  const floorTexture = useTexture(floorTextureUrl);
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(4, 4); // Adjust scale based on UVs

  // Traverse and swap material safely
  scene.traverse((child) => {
    if (child.isMesh && child.name === 'LR_floor') {
      // Create a new material to avoid mutating shared materials
      child.material = new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.8, // Can also load a roughness map here
      });
    }
    
    // Safety Lock: Ensure walls cannot be moved
    if (child.name.includes('wall') || child.name.includes('window')) {
      child.userData.locked = true;
    }
  });

  return <primitive object={scene} />;
}
```

### B. Camera Anchors Definition

```javascript
// public/data/camera_anchors.json
export const cameraAnchors = {
  LR_CAM_01: {
    pos: [1.8, 1.6, 2.2],    // Eye level (1.6m)
    target: [1.8, 1.2, 0.5], // Looking slightly down towards the center
    fov: 45
  },
  BR_CAM_01: {
    pos: [3.0, 1.6, 1.0],
    target: [2.2, 1.0, 0.5],
    fov: 50
  },
  KIT_CAM_01: {
    pos: [-1.5, 1.6, 1.0],
    target: [-1.5, 1.0, -1.0],
    fov: 45
  }
};
```

---

## 4. Render API Contracts

### POST `/api/render` (Node.js API Route -> FastAPI ML Endpoint)

**Request Body:**
```json
{
 "session_id": "abc123_xyz890",
 "unit_id": "2BHK_DELUXE_02",
 "room": "Living Room",
 "structured_prompt": {
   "style": "modern-warm",
   "materials": ["natural_oak", "beige_matte", "brushed_brass"],
   "budget_tier": "premium",
   "furniture_density": "medium",
   "facing": "west-evening"
 },
 "mask_ref": "s3://shreetisai-assets/masks/floorplan_2bhk_deluxe_LR_mask.png",
 "camera_anchor": "LR_CAM_01"
}
```

**Response (202 Accepted):**
```json
{
 "job_id": "job_987654321",
 "status": "queued",
 "estimated_outputs": [
   "s3://shreetisai-renders/abc123_xyz890/LR_CAM_01_render_4096.jpg",
   "s3://shreetisai-renders/abc123_xyz890/LR_floor_albedo.png"
 ],
 "eta_seconds": 12
}
```

### GET `/api/render/status/{job_id}`

**Response (200 OK - Completed):**
```json
{
 "job_id": "job_987654321",
 "status": "completed",
 "outputs": {
   "render_url": "https://cdn.shreetisai.com/renders/abc123_xyz890/LR_CAM_01_render_4096.jpg",
   "textures": {
     "LR_floor_albedo": "https://cdn.shreetisai.com/renders/abc123_xyz890/LR_floor_albedo.png"
   },
   "equirect360_url": "https://cdn.shreetisai.com/renders/abc123_xyz890/LR_CAM_01_360.jpg"
 }
}
```
