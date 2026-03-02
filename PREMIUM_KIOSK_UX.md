# D — Premium UX Flow (Kiosk)

This document outlines the pixel-perfect, premium on-site kiosk experience, focusing on high-end aesthetics, precise microcopy, and emotional resonance.

## 1. Entry Screen (The Hook)
*A stark, immersive beginning to focus the user's imagination.*

*   **Visual:** Pure black screen, minimal UI.
*   **Headline:** "Describe the home you see."
*   **Subcopy:** "In one line — mood, main material, and one wish."
*   **Interaction:** A single, elegant text input box (or voice-to-text microphone icon for frictionless kiosk input).
*   **Ambient Cue:** Low-volume warm synth playing continuously in the background.

## 2. Processing Screen (20–40s)
*Building anticipation without frustration. Showing the "work" as art.*

*   **Copy:** "Translating your imagination into space…"
*   **Visual:** No loading spinners. Instead, an animated wireframe of the floorplan assembling itself from glowing architectural lines.
*   **Animation Timing:** 
    *   Wireframe assemble: `800ms` per layer (e.g., structural walls first, then furniture outlines, then lighting grids).

## 3. Reveal Screen (Emotion Peak)
*The "Wow" moment. High-fidelity payoff.*

*   **Copy:** "Here is your living room — evening view."
*   **Visual:** The wireframe dissolves into the photorealistic 4K render.
*   **Animation Timing:** 
    *   Render fade-in: `1200ms` ease-in-out.
*   **Ambient Cue:** A soft, satisfying "whoosh" sound synchronized perfectly with the render fade-in.
*   **Action Buttons:** 
    *   "Save this design"
    *   "Compare style"
    *   "Share to WhatsApp"
    *   "Book private tour"
*   **Interaction:** Button micro-lift on hover/touch: `180ms` transition.

## 4. Compare Screen
*Rationalizing the emotional choice.*

*   **Visual:** Two large, side-by-side thumbnails (Option A / Option B).
*   **Interaction:** "Love this" toggle buttons overlaid on each thumbnail, allowing the user to definitively choose their preferred aesthetic.

## 5. Lead-Capture Modal
*The conversion point. Triggered **only** after the user clicks "Save this design" or "Book private tour".*

*   **Tone:** Exclusive, concierge-level service.
*   **Fields:**
    1.  Name
    2.  Phone
    3.  Email
    4.  Preferred Visit Time *(Interactive calendar/time-slot picker)*
    5.  Budget band *(Elegant dropdown or pill select)*
*   **CTA Button Copy:** "Request Private Tour"
*   **Animation Timing:** Modal glides in smoothly; button micro-lift on hover (`180ms`).
