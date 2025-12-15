import { GoogleGenAI, Type } from "@google/genai";
import type { AnalyzedReceiptData } from '../types';

// Helper om bestand naar Base64 string te converteren (zonder de data:image/... prefix)
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Split op de komma om alleen de base64 data te krijgen
      const base64Data = result.split(',')[1]; 
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeReceipt = async (imageFile: File, apiKey?: string): Promise<AnalyzedReceiptData> => {
  const base64Data = await fileToBase64(imageFile);

  // STRATEGIE 1: CLIENT-SIDE (Direct vanuit de browser)
  // Dit wordt gebruikt als de gebruiker een handmatige API Key heeft ingevuld in Instellingen.
  // Dit lost 401-fouten op die ontstaan door server-restricties of Netlify-problemen.
  if (apiKey && apiKey.trim().length > 0) {
    try {
      console.log("Start client-side analyse met custom key...");
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: imageFile.type || 'image/jpeg',
                data: base64Data
              }
            },
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

      const text = response.text;
      if (!text) throw new Error("Geen resultaat ontvangen van Google AI.");

      return JSON.parse(text) as AnalyzedReceiptData;

    } catch (error: any) {
      console.error("Client-side analyse fout:", error);
      let msg = error.message || "Onbekende fout";
      if (msg.includes("401")) msg = "Ongeldige API Key (401). Controleer uw sleutel in Instellingen.";
      if (msg.includes("403")) msg = "Toegang geweigerd (403). Controleer of de API Key geldig is en toegang heeft tot Gemini.";
      throw new Error(`Client-side verwerking mislukt: ${msg}`);
    }
  }

  // STRATEGIE 2: SERVER-SIDE (Via Netlify Function)
  // Dit wordt gebruikt als er GEEN custom key is ingevuld (fallback naar server env var).
  console.log("Start server-side analyse (geen custom key)...");
  const response = await fetch('/.netlify/functions/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Data,
      mimeType: imageFile.type,
      // Geen apiKey meesturen, de server pakt zijn eigen env var
    }),
  });

  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    let errorMessage = `Server fout (Status: ${response.status})`;
    
    // Probeer de JSON error body te lezen
    if (contentType && contentType.includes("application/json")) {
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        const text = await response.text();
        if (text) errorMessage = text;
      }
    } else {
        const text = await response.text();
        if (text) errorMessage = text;
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as AnalyzedReceiptData;
};