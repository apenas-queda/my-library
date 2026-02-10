
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchBookDetails = async (title: string, author: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide details for the book or comic titled "${title}" by "${author}". 
      I need the total number of pages (or chapters if it's a comic) and a very short 1-sentence description.
      Also suggest a high-quality placeholder image URL from a public source if possible, or describe what the cover usually looks like.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalPages: { type: Type.NUMBER },
            description: { type: Type.STRING },
            suggestedCoverKeywords: { type: Type.STRING }
          },
          required: ["totalPages", "description"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
};
