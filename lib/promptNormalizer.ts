import { GoogleGenAI, Type } from "@google/genai";

export interface StructuredPrompt {
  unit_id: string;
  room: string;
  facing: string;
  style: string;
  materials: string[];
  furniture_density: string;
  budget_tier: string;
  constraints: string[];
  camera: string;
  deliverables: string[];
}

/**
 * Converts a raw user sentence into a structured JSON prompt for the rendering engine.
 * This acts as a "quick UI normalizer" extracting keywords for style, materials, mood, and budget.
 */
export async function normalizeUserPrompt(
  rawInput: string,
  context: { unit_id?: string; room?: string; defaultStyle?: string; defaultBudget?: string } = {}
): Promise<StructuredPrompt> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API Key");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are an AI interior design prompt normalizer.
    Convert the raw user input into a structured JSON prompt.
    Extract keywords for style, materials, mood, and budget.
    If missing, use the provided fallback context or reasonable defaults for a high-end real estate application.
    
    Fallback Context:
    Unit ID: ${context.unit_id || "2BHK_DELUXE_02"}
    Room: ${context.room || "Living Room"}
    Default Style: ${context.defaultStyle || "modern-warm"}
    Default Budget: ${context.defaultBudget || "premium"}
    
    Ensure the output strictly adheres to the JSON schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Raw user input: "${rawInput}"`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          unit_id: { type: Type.STRING, description: "The unit identifier (e.g., 2BHK_DELUXE_02)" },
          room: { type: Type.STRING, description: "The specific room (e.g., Living Room, Master Bedroom)" },
          facing: { type: Type.STRING, description: "Lighting condition/facing (e.g., west-evening, east-morning)" },
          style: { type: Type.STRING, description: "The interior style (e.g., modern-warm, japandi, minimal-luxe)" },
          materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of materials (e.g., natural_oak, brushed_brass)" },
          furniture_density: { type: Type.STRING, description: "low, medium, or high" },
          budget_tier: { type: Type.STRING, description: "standard, premium, or signature" },
          constraints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of structural constraints (e.g., lock_walls, clear_0.9m_circulation)" },
          camera: { type: Type.STRING, description: "Camera anchor ID (e.g., LR_CAM_01)" },
          deliverables: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of deliverables (e.g., render_4096, albedo, roughness, equirect360)" }
        },
        required: ["unit_id", "room", "facing", "style", "materials", "furniture_density", "budget_tier", "constraints", "camera", "deliverables"]
      }
    }
  });

  try {
    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr) as StructuredPrompt;
  } catch (error) {
    console.error("Failed to parse structured prompt:", error);
    throw new Error("Failed to normalize prompt");
  }
}
