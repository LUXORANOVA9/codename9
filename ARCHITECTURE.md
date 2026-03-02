# Project Skeleton: On-Site Text→3D Interior Engine

## 1. System Architecture Diagram

```text
[ Client Device (iPad/Kiosk) ]
       │
       ├─► Frontend (Next.js + React Three Fiber)
       │      ├─► 360° Viewer (Equirectangular Projection)
       │      ├─► Floorplan Mask Overlay (Canvas)
       │      └─► Session Manager (Zustand)
       │
[ API Gateway (Next.js API Routes) ]
       │
       ├─► /api/session (Init & State)
       ├─► /api/render (GPU Job Dispatch)
       └─► /api/crm (Lead Capture Hook)
       │
[ Backend Services ]
       │
       ├─► Prompt Engine (Node.js + Gemini Pro)
       │      └─► Expands "zen" -> "minimalist, wood textures, soft lighting..."
       │
       ├─► Floorplan Converter (Python/OpenCV - Offline/Pre-process)
       │      ├─► Input: floorplan_2bhk_deluxe.jpg
       │      └─► Output: depth_map.png, segmentation_mask.png, unit_geom.glb
       │
       └─► Render Engine (Python + Stable Diffusion XL / ControlNet)
              ├─► Inputs: Prompt + Depth Mask + Canny Edge
              └─► Output: render_360.jpg (Equirectangular)
       │
[ Data & Storage ]
       │
       ├─► Redis (Job Queue & Active Sessions)
       ├─► PostgreSQL (Leads, Project Metadata)
       └─► AWS S3 (Assets: masks, glb, generated renders)
```

## 2. Recommended Stack

*   **Frontend:** Next.js 15 (React), Tailwind CSS, React Three Fiber (R3F), Zustand.
*   **Backend:** Node.js (Next.js API Routes), BullMQ (Job Queue).
*   **ML Runtime:** Python (FastAPI) running SDXL Turbo or LCM with ControlNet (Depth/Canny).
*   **Database:** PostgreSQL (Persistent Data), Redis (Hot State/Queues).
*   **Hosting:** Vercel (Web), RunPod/AWS G5 (GPU Inference), AWS S3 (Storage).

## 3. Folder Layout (Production Repo)

```text
/
├── assets/                    # Raw source assets (not public)
│   ├── floorplan_2bhk_deluxe.jpg
│   └── typical_floorplate.jpg
├── frontend/                  # Next.js Application
│   ├── public/
│   │   ├── models/
│   │   │   └── unit_geom.glb
│   │   └── textures/
│   │       └── placeholder_360.jpg
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Main Kiosk Interface
│   │   │   └── api/
│   │   │       ├── render/
│   │   │       └── leads/
│   │   ├── components/
│   │   │   ├── Viewer360.tsx  # R3F Sphere Mapping
│   │   │   ├── FloorplanOverlay.tsx
│   │   │   └── LeadForm.tsx
│   │   └── store/
│   │       └── useSession.ts
│   └── package.json
├── ml_engine/                 # Python Inference Service
│   ├── app.py                 # FastAPI Entrypoint
│   ├── pipeline.py            # SDXL + ControlNet Logic
│   ├── converter.py           # OpenCV Floorplan Processor
│   └── requirements.txt
├── docker-compose.yml         # Local Dev Orchestration
└── README.md
```

## 4. Minimal REST Endpoints & Data Contracts

### POST /api/v1/render
**Request:**
```json
{
  "sessionId": "sess_8923",
  "floorplanId": "2bhk_deluxe",
  "prompt": "Modern scandinavian, oak wood flooring, sunset lighting",
  "maskId": "living_room_view_1"
}
```
**Response:**
```json
{
  "jobId": "job_5521",
  "status": "queued",
  "estimatedTime": 35
}
```

### GET /api/v1/render/:jobId
**Response:**
```json
{
  "status": "completed",
  "assets": {
    "panorama": "https://s3.aws.com/.../render_360.jpg",
    "depth": "https://s3.aws.com/.../depth_debug.png"
  }
}
```

### POST /api/v1/leads
**Request:**
```json
{
  "sessionId": "sess_8923",
  "contact": {
    "name": "Raj Khemani",
    "phone": "+919876543210"
  },
  "preferences": {
    "style": "Scandinavian",
    "budget": "Premium"
  }
}
```

## 5. Lean MVP Feature List

1.  **Floorplan Selector:** Carousel to choose between `2bhk_deluxe` and `typical_floorplate`.
2.  **Prompt Builder:** "Mad-libs" style input (Style + Mood + Budget) -> "Modern" + "Cozy" + "High".
3.  **360° Viewer:** WebGL viewer using `render_360.jpg` mapped to a sphere. Gyroscope enabled for mobile.
4.  **Save Design:** Persist the generated view and prompt to a shareable URL.
5.  **Lead Capture:** Unlock "High Res Download" or "Email to Me" after form submission.

## 6. Constraints & TTFR Strategy

*   **Structural Integrity:**
    *   **Pre-computed Masks:** We do NOT generate geometry on the fly. We use pre-baked Depth and Canny Edge maps derived from the 3D model (`unit_geom.glb`) or the floorplan image.
    *   **ControlNet:** The ML pipeline uses `ControlNet-Depth` and `ControlNet-Canny` with a high guidance scale (1.2 - 1.5) to force the diffusion model to respect walls, windows, and furniture placement exactly.
*   **Time-to-First-Render (TTFR) < 40s:**
    *   **SDXL Turbo / LCM:** Use Latent Consistency Models to reduce inference steps from 50 to 4-8.
    *   **Resolution Staging:** Generate a 1024x512 preview (approx 5-8s) first, then background process the 4k version.
    *   **Caching:** Cache common prompts ("Modern 2BHK") to serve instant results for popular queries.

## 7. Asset File Names

*   **Input:** `floorplan_2bhk_deluxe.jpg`, `typical_floorplate.jpg`
*   **Intermediate:** `mask_2bhk_living.png`, `depth_2bhk_living.png`
*   **3D Geometry:** `unit_geom.glb` (for R3F alignment)
*   **Output:** `render_360.jpg`
*   **State:** `design_session.json`
