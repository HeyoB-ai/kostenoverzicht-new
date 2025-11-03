
import { GoogleGenAI, Type } from '@google/genai';
import type { AnalyzedReceiptData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeReceipt = async (imageFile: File): Promise<AnalyzedReceiptData> => {
  const imagePart = await fileToGenerativePart(imageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        imagePart,
        { text: 'Analyze the provided image of a car maintenance receipt. Extract the vendor name, transaction date (in YYYY-MM-DD format), the total amount as a number, and a brief description of services or items. If you cannot determine a value, use null.' }
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vendor: { type: Type.STRING, description: 'The name of the vendor or shop.' },
          date: { type: Type.STRING, description: 'The date of the transaction in YYYY-MM-DD format.' },
          total: { type: Type.NUMBER, description: 'The final total amount of the receipt.' },
          description: { type: Type.STRING, description: 'A brief summary of the services performed or items purchased.' },
        },
        required: ['vendor', 'date', 'total', 'description'],
      },
    },
  });

  const jsonText = response.text.trim();
  try {
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as AnalyzedReceiptData;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response:", jsonText);
    throw new Error("Could not parse the analysis result from the AI.");
  }
};
