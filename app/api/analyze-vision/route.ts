import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt, unit } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemInstruction = `You are an expert interior design AI assistant. 
    Analyze the user's vision for their apartment (${unit}).
    Provide 3 specific, actionable suggestions to improve or clarify their vision.
    Also, recommend a design style (Modern, Luxury, Minimal, Warm, Contemporary) based on their description.
    Finally, generate a refined version of their prompt that incorporates professional design terminology.
    
    Return the response in JSON format with the following structure:
    {
      "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
      "recommendedStyle": "Style Name",
      "refinedPrompt": "Refined prompt text..."
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing vision:', error);
    return NextResponse.json({ error: 'Failed to analyze vision' }, { status: 500 });
  }
}
