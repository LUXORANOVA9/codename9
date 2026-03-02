# PHASE 5 — On-Site Kiosk UX Flow (60–90s)

**Context:** A prospective buyer is standing at an iPad Pro or large touch kiosk in the sales gallery. The goal is to move them from passive observation to emotional ownership and lead capture in under 90 seconds.

---

## Screen 1: The Hook (0–5s)
*The attract loop. Designed to pull them across the room.*

*   **Microcopy:** "Step inside your future home. Design it in seconds."
*   **Secondary Copy:** "Tap to begin your bespoke interior journey."
*   **Animations:** 
    *   Background: Slow, continuous pan across a hyper-realistic living room (`15000ms` linear loop).
    *   CTA Button: Soft, rhythmic breathing scale (`0.98` to `1.02` over `2000ms`).
*   **Emotional Trigger:** Aspiration, Curiosity.
*   **Sensory Cues:** 
    *   *Audio:* Soft, warm ambient synth pad. 
    *   *Lighting:* Screen at 100% brightness, warm color temperature.

---

## Screen 2: The Input (5–20s)
*Frictionless personalization. No typing, just tapping.*

*   **Microcopy:** "What does your dream space feel like?"
*   **Options:** Large, tactile image cards (Modern Warm, Japandi, Minimal-Luxe).
*   **Animations:**
    *   Cards slide up and fade in with a stagger (`400ms` duration, `100ms` delay between each).
    *   Selection state: Card slightly elevates (`-4px` Y-axis, `200ms`) with a golden border glow.
*   **Emotional Trigger:** Control, Personalization, Identity.
*   **Sensory Cues:** 
    *   *Audio:* Crisp, organic "tick" sound on tap (like a high-end camera dial).

---

## Screen 3: The Processing (20–30s)
*Building anticipation. Show the "work" to build value.*

*   **Microcopy:** (Cycles every 3 seconds)
    1. "Analyzing structural floorplan..."
    2. "Sourcing premium materials..."
    3. "Rendering your exact vision..."
*   **Animations:**
    *   A 2D blueprint morphs into a 3D wireframe, then begins filling with light (`8000ms` sequence).
    *   Progress bar fills non-linearly (fast to 80%, pauses, then snaps to 100%).
*   **Emotional Trigger:** Anticipation, Trust in the technology.
*   **Sensory Cues:** 
    *   *Audio:* Low, building hum that rises slightly in pitch.
    *   *Lighting:* Screen dims slightly (`80%`), preparing for the bright reveal.

---

## Screen 4: The Reveal (30–50s)
*The "Wow" moment. The emotional peak.*

*   **Microcopy:** "Welcome home. Here is your Modern Warm sanctuary."
*   **Animations:**
    *   Flash of pure white light (`150ms` fade out) revealing the photoreal render.
    *   Image slowly scales up (`1.0` to `1.05` over `20000ms`) to feel immersive and alive.
*   **Emotional Trigger:** Awe, Attachment, Desire.
*   **Sensory Cues:** 
    *   *Audio:* A soft, resolving orchestral swell or warm chime.
    *   *Lighting:* Screen snaps back to 100% brightness.

---

## Screen 5: Compare & Tweak (50–70s)
*Rationalizing the emotional choice. Showing value.*

*   **Microcopy:** "Drag to see the bare floorplan. Tap to upgrade finishes."
*   **Animations:**
    *   Before/After slider follows finger instantly (`0ms` latency).
    *   Tapping an upgrade (e.g., "Smart Home") triggers a soft ripple effect (`300ms`) and updates the live price counter with a rolling number animation (`500ms`).
*   **Emotional Trigger:** Ownership, Value Realization, FOMO (on upgrades).
*   **Sensory Cues:** 
    *   *Audio:* Satisfying, heavier "thud" or "click" when adding premium upgrades.

---

## Screen 6: The Capture (70–90s)
*The Ask. Capitalizing on the peak emotional state.*

*   **Microcopy:** "Love this design? Save it to your portfolio and lock pricing."
*   **Animations:**
    *   Modal drops in from top with a slight spring bounce (`600ms` duration, `0.5` bounce tension).
    *   Background render blurs heavily (`10px` blur over `400ms`) to focus attention.
*   **Exact Field List (Lead Capture Modal):**
    1.  **First Name** *(Text input - Make it personal)*
    2.  **Last Name** *(Text input - For CRM matching)*
    3.  **Email Address** *(Email input - "Where should we send your high-res renders?")*
    4.  **Phone Number** *(Tel input - Optional)*
    5.  **Move-in Timeline** *(Pill toggles: ASAP | 3-6 Months | 6+ Months - Crucial for sales qualification)*
*   **CTA Button:** "Send My Renders & Lock Price"
*   **Emotional Trigger:** Urgency, Exclusivity, Security.
*   **Sensory Cues:** 
    *   *Audio:* Positive, ascending double-chime on successful submission.
    *   *Visual:* A green checkmark draws itself (`400ms`), followed by "A sales director will be with you shortly."
