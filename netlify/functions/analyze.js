import { GoogleGenAI, Type } from '@google/genai';

export default async (req, context) => {
  // Alleen POST verzoeken toestaan
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Ongeldige JSON body." }), { status: 400 });
    }

    const { image, mimeType, apiKey: customApiKey } = body;

    // 1. Bepaal welke API Key we gebruiken.
    // PRIORITEIT: 1. Key uit Instellingen (body), 2. Key uit Environment (Netlify)
    let rawApiKey = customApiKey || process.env.VITE_API_KEY || process.env.API_KEY;

    if (!rawApiKey) {
      console.error("CRITISCH: Geen API Key gevonden in request of environment.");
      return new Response(JSON.stringify({ error: "Server configuratie fout: Geen API Key gevonden. Voer uw sleutel in via Instellingen of configureer Netlify." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. AGRESSIEVE SCHOONMAAK
    const apiKey = rawApiKey.replace(/["'\s\n\r]/g, '');

    // Debug log (veilig)
    console.log(`API Key wordt gebruikt. Lengte: ${apiKey.length}. Bron: ${customApiKey ? 'App Instellingen' : 'Netlify Env'}`);

    if (!image) {
      return new Response(JSON.stringify({ error: "Geen afbeelding ontvangen." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Initialiseer Gemini AI
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Het model en de prompt configuratie
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
    console.error("Gemini API Error Full:", error);
    
    let errorMessage = "Fout bij verwerken bonnetje.";
    
    if (error.message) {
        if (error.message.includes("401")) {
            errorMessage = "Authenticatie fout bij Google (401). Als u dit ziet, probeer dan uw API Key handmatig in te voeren bij Instellingen. Mogelijk blokkeert Google de server-toegang (IP/Referrer restricties).";
        } else if (error.message.includes("403")) {
             errorMessage = "Toegang geweigerd (403). Mogelijke oorzaken: API niet ingeschakeld in Google Cloud Console, of billing limiet bereikt.";
        } else {
            errorMessage += " " + error.message;
        }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};