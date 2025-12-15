import { GoogleGenAI, Type } from '@google/genai';
import type { AnalyzedReceiptData } from '../types';

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        imagePart,
        { text: 'Analyseer de afbeelding van dit onderhoudsbonnetje. Extraheer de naam van de leverancier, de transactiedatum (in JJJJ-MM-DD-formaat), het totaalbedrag als een getal, en een korte omschrijving van de diensten of producten. Gebruik null als je een waarde niet kunt vinden.' }
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vendor: { type: Type.STRING, description: 'De naam van de leverancier of winkel.' },
          date: { type: Type.STRING, description: 'De datum van de transactie in JJJJ-MM-DD-formaat.' },
          total: { type: Type.NUMBER, description: 'Het uiteindelijke totaalbedrag van de bon.' },
          description: { type: Type.STRING, description: 'Een korte samenvatting van de uitgevoerde diensten of gekochte artikelen.' },
        },
        required: ['vendor', 'date', 'total', 'description'],
      },
    },
  });

  const jsonText = response.text ? response.text.trim() : "";
  try {
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as AnalyzedReceiptData;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response:", jsonText);
    throw new Error("Kon het analyseresultaat van de AI niet verwerken.");
  }
};