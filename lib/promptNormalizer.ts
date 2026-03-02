import { GoogleGenAI, SchemaType } from "@google/genai";

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
    throw new Error("Missing Gemini API Key. Please set NEXT_PUBLIC_GEMINI_API_KEY in Secrets.");
  }

  const ai = new GoogleGenAI(apiKey);
  const model = ai.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          unit_id: { type: SchemaType.STRING },
          room: { type: SchemaType.STRING },
          facing: { type: SchemaType.STRING },
          style: { type: SchemaType.STRING },
          materials: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          furniture_density: { type: SchemaType.STRING },
          budget_tier: { type: SchemaType.STRING },
          constraints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          camera: { type: SchemaType.STRING },
          deliverables: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["unit_id", "room", "facing", "style", "materials", "furniture_density", "budget_tier", "constraints", "camera", "deliverables"]
      }
    }
  });

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

  const result = await model.generateContent(`${systemInstruction}\n\nRaw user input: "${rawInput}"`);
  const text = result.response.text();

  try {
    return JSON.parse(text) as StructuredPrompt;
  } catch (error) {
    console.error("Failed to parse structured prompt:", error);
    throw new Error("Failed to normalize prompt");
  }
}
