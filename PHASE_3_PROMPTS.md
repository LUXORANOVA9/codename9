# PHASE 3 — Prompt Engineering for Interiors (text→render)

## System Prompt / Template Definition
This structured template is designed to be fed into a ControlNet-enabled image generation model (like Stable Diffusion XL with MLSD/Depth ControlNet or Gemini 3.1 Flash Image Preview with spatial grounding). It strictly enforces architectural boundaries while allowing creative freedom within the interior volume.

```text
[unit_id]: {unit_identifier}
[room]: {room_name}
[facing]: {lighting_condition}
[floorplan_mask]: {attached_mask_reference}
[style]: {style_name} (choose from: modern-warm, japandi, minimal-luxe, dark-masculine, light-scandi)
[materials_palette]: {primary, secondary, metal}
[furniture_density]: low/medium/high
[budget_tier]: standard / premium / signature
[constraints]: do NOT alter walls, windows, or ceiling; keep circulation clear; scale furniture to 1:1
[camera]: {lens_mm}, camera_anchor {anchor_id}
[deliverable]: photoreal 4096px render + albedo/roughness/normal textures for swap + 360 EQUIRECTANGULAR (if possible)
```

---

## Example Filled Prompts

### Example 1: Modern Warm (Provided Baseline)
**[unit_id]:** 2BHK_DELUXE_02
**[room]:** Living Room
**[facing]:** West evening light
**[floorplan_mask]:** floorplan_2bhk_deluxe.jpg (LR area)
**[style]:** modern-warm
**[materials_palette]:** natural oak, matte beige, brushed brass
**[furniture_density]:** medium
**[budget_tier]:** premium
**[constraints]:** do NOT alter walls/windows/doors; sofa length <= 2.2m; leave 0.9m clear circulation to dining
**[camera]:** 35mm, anchor LR_CAM_01
**[deliverable]:** photoreal 4096px render + albedo map + roughness map + 360 equirect

*Rationale:* Establishes a welcoming, high-end living space. The constraint on sofa length ensures it doesn't block the open-plan flow to the dining area, a common issue in AI hallucinations.

---

### Example 2: Japandi
**[unit_id]:** 2BHK_DELUXE_02
**[room]:** Master Bedroom
**[facing]:** East morning light
**[floorplan_mask]:** floorplan_2bhk_deluxe.jpg (MBR area)
**[style]:** japandi
**[materials_palette]:** light ash wood, unbleached linen, matte black accents
**[furniture_density]:** low
**[budget_tier]:** standard
**[constraints]:** do NOT alter walls/windows/doors; bed size queen (1.6m width); maintain 1.0m clearance around bed; low-profile furniture only; no ceiling fixtures (use floor/table lamps)
**[camera]:** 50mm, anchor MBR_CAM_02
**[deliverable]:** photoreal 4096px render + albedo map + roughness map + 360 equirect

*Rationale:* Japandi thrives on minimalism, low profiles, and natural light. A "low" furniture density and "standard" budget emphasize clean, functional, unpretentious design. The 50mm lens compresses the space slightly to focus on the textures of the ash wood and linen under soft morning light.

---

### Example 3: Minimal-Luxe
**[unit_id]:** 2BHK_DELUXE_02
**[room]:** Kitchen & Dining
**[facing]:** South mid-day light
**[floorplan_mask]:** floorplan_2bhk_deluxe.jpg (KIT_DIN area)
**[style]:** minimal-luxe
**[materials_palette]:** calacatta marble, fluted dark walnut, polished nickel
**[furniture_density]:** medium
**[budget_tier]:** signature
**[constraints]:** do NOT alter walls/windows/doors; keep kitchen island exact dimensions from plan; dining table max 6 seats; seamless built-in appliances; no clutter on counters
**[camera]:** 24mm wide-angle, anchor KIT_CAM_01
**[deliverable]:** photoreal 4096px render + albedo map + roughness map + 360 equirect

*Rationale:* Minimal-luxe requires high-end materials (marble, fluted wood) and a "signature" (highest) budget tier. The 24mm wide lens captures the open-plan flow between the kitchen and dining areas. Strict constraints ensure the expensive, fixed island fits the structural footprint perfectly without AI-generated structural drift.

---

### Example 4: Dark-Masculine
**[unit_id]:** 2BHK_DELUXE_02
**[room]:** Home Office / Den
**[facing]:** North diffused light
**[floorplan_mask]:** floorplan_2bhk_deluxe.jpg (DEN area)
**[style]:** dark-masculine
**[materials_palette]:** smoked oak, charcoal leather, gunmetal
**[furniture_density]:** high
**[budget_tier]:** premium
**[constraints]:** do NOT alter walls/windows/doors; include floor-to-ceiling bookshelf on east solid wall; heavy executive desk must face window; heavy drapery; ambient cove lighting
**[camera]:** 35mm, anchor DEN_CAM_03
**[deliverable]:** photoreal 4096px render + albedo map + roughness map + 360 equirect

*Rationale:* A moody, dark-masculine aesthetic works best with diffused northern light to avoid harsh glare on dark, reflective surfaces (like leather). High furniture density (bookshelves, heavy desk, leather chair) creates a cozy, enclosed "cigar lounge" feel, fitting for a premium tier workspace.

---

### Example 5: Light-Scandi
**[unit_id]:** 2BHK_DELUXE_02
**[room]:** Guest Bedroom / Kids Room
**[facing]:** West afternoon sun
**[floorplan_mask]:** floorplan_2bhk_deluxe.jpg (GBR area)
**[style]:** light-scandi
**[materials_palette]:** birch plywood, pastel sage green, white powder-coated steel
**[furniture_density]:** medium
**[budget_tier]:** standard
**[constraints]:** do NOT alter walls/windows/doors; include twin bed against north wall; compact study desk; maximize open floor play area; sheer curtains only to maximize light
**[camera]:** 35mm, anchor GBR_CAM_01
**[deliverable]:** photoreal 4096px render + albedo map + roughness map + 360 equirect

*Rationale:* Light-Scandi is highly accessible, bright, and functional, perfect for a standard budget guest or kids' room. The pastel and birch palette maximizes the bright afternoon sun. The constraints specifically force the AI to push furniture against the walls to prioritize usable floor space, a common requirement for secondary bedrooms.
