import { GoogleGenAI, Type } from '@google/genai';

export default async (req, context) => {
  // Alleen POST verzoeken toestaan
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Haal de API key uit de omgevingsvariabelen (server-side, dus veilig)
    const apiKey = process.env.VITE_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server configuratie fout: API Key ontbreekt." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Lees de data van de frontend
    const body = await req.json();
    const { image, mimeType } = body;

    if (!image) {
      return new Response(JSON.stringify({ error: "Geen afbeelding ontvangen." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Initialiseer Gemini AI
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Het model en de prompt configuratie (verplaatst van frontend naar backend)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: image
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

    const jsonText = response.text ? response.text.trim() : "{}";
    
    // Stuur het resultaat terug naar de frontend
    return new Response(jsonText, {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: "Fout bij verwerken bonnetje: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};