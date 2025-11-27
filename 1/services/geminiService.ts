import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCleanDiagram = async (
  imageBase64: string,
  promptText: string
): Promise<string> => {
  const client = getClient();
  
  // Remove header if present (e.g., "data:image/png;base64,")
  const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: promptText,
          },
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, or detect from header
              data: cleanBase64,
            },
          },
        ],
      },
    });

    let generatedImageBase64 = '';

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageBase64 = part.inlineData.data;
          break; 
        }
      }
    }

    if (!generatedImageBase64) {
      // Sometimes it might return text if it refuses or fails to generate an image
      const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;
      if (textPart) {
        throw new Error(`Gemini generated text instead of an image: ${textPart}`);
      }
      throw new Error("No image data found in response");
    }

    return `data:image/jpeg;base64,${generatedImageBase64}`;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};