# AI Studio Applet — Shree Tisai Grand

## Overview
A Next.js 15 real estate kiosk application for "Shree Tisai Grand" apartments. Offers an AI-personalized apartment buying experience with 3D spatial viewing, AR overlay, AI-generated interior renders (via Gemini), and lead capture.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **3D/AR**: Three.js + @react-three/fiber + @react-three/drei
- **AI**: Google GenAI (@google/genai) — Gemini 2.5 Flash for image generation
- **Animation**: Motion (motion/react)
- **Runtime**: Node.js 20

## Project Structure
```
app/
  page.tsx           — Main multi-step app (Unit Selection → Vision → Review → Reserve)
  layout.tsx         — Root layout
  globals.css        — Global styles
  api/
    analyze-vision/route.ts   — Vision analysis API route
    leads/route.ts            — Lead capture API route
components/
  SpatialViewer.tsx  — Three.js 3D viewer component
hooks/
  use-mobile.ts      — Mobile detection hook
lib/
  promptNormalizer.ts — Normalizes user prompts via Gemini
  utils.ts            — Utility functions
public/
  data/
    camera_anchors.json — 3D camera anchor positions
    materials.json      — Material definitions
```

## Environment Variables
- `GEMINI_API_KEY` — Required for AI image generation and prompt normalization
- `NEXT_PUBLIC_GEMINI_API_KEY` — Client-side Gemini API key (used directly in browser)
- `APP_URL` — The hosted URL of the app

## Development
- **Dev server**: `npm run dev` (port 5000, host 0.0.0.0)
- **Build**: `npm run build`
- **Start**: `npm start`

## Configuration Notes
- Next.js configured with `allowedDevOrigins: ['*']` for Replit proxy support
- `output: 'standalone'` for production deployment
- Deployment: autoscale, build with `npm run build`, run with `node .next/standalone/server.js`
