import { GoogleGenAI, Type } from '@google/genai';
import type { AnalyzedReceiptData } from '../types';

// HULPFUNCTIE: Haal de API Key veilig op zonder te crashen in de browser.
const getApiKey = () => {
  try {
    // @ts-ignore - Check voor Vite environment variabele (standaard voor dit project)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ga stilzwijgend door
  }

  try {
    // @ts-ignore - Fallback voor Node/andere omgevingen
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
  } catch (e) {
    // Negeer errors
  }

  return '';
};

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
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key ontbreekt. Zorg dat de variabele 'VITE_API_KEY' is ingesteld in Netlify Environment Variables.");
  }

  // We initialiseren de AI pas HIER, op het moment dat de functie wordt aangeroepen.
  // Dit voorkomt dat de app crasht bij het laden van de pagina als de key ontbreekt.
  const ai = new GoogleGenAI({ apiKey: apiKey });

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