import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeBias = async (pair: string, direction: string, notes: string = "") => {
  const client = getClient();
  if (!client) return "API Key missing. Please set your Gemini API Key in the environment.";

  try {
    const prompt = `
      I am a professional trader planning a trade.
      Pair: ${pair}
      Bias Direction: ${direction}
      My Notes: ${notes}

      Please provide a concise technical analysis checklist (max 3 bullet points) 
      of what I should look for before entering this ${direction} trade. 
      Keep it strictly technical (Structure, Key Levels, Price Action).
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error", error);
    return "Could not generate analysis at this time.";
  }
};
