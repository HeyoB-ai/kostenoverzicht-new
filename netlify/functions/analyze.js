import { GoogleGenAI, Type } from '@google/genai';

export default async (req, context) => {
  // Alleen POST verzoeken toestaan
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 1. Probeer beide mogelijke namen voor de API key
    let rawApiKey = process.env.VITE_API_KEY || process.env.API_KEY;

    if (!rawApiKey) {
      console.error("CRITISCH: Geen API Key gevonden in environment variables (VITE_API_KEY of API_KEY).");
      return new Response(JSON.stringify({ error: "Server configuratie fout: API Key ontbreekt in Netlify instellingen." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. AGRESSIEVE SCHOONMAAK
    // Verwijder alles wat geen letter, cijfer of symbool is die in keys voorkomt.
    // Specifiek: verwijder quotes (" of '), spaties, tabs, newlines.
    const apiKey = rawApiKey.replace(/["'\s\n\r]/g, '');

    // Debug log (veilig: laat alleen lengte en laatste 4 tekens zien)
    console.log(`API Key geladen. Lengte: ${apiKey.length}. Eindigt op: ...${apiKey.slice(-4)}`);

    // Lees de data van de frontend
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Ongeldige JSON body." }), { status: 400 });
    }

    const { image, mimeType } = body;

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
    
    // Probeer een duidelijke foutmelding terug te geven
    let errorMessage = "Fout bij verwerken bonnetje.";
    
    if (error.message) {
        if (error.message.includes("401")) {
            errorMessage = "Authenticatie fout bij Google (401). De API Key is waarschijnlijk onjuist of niet geactiveerd voor Gemini API. Check Netlify logs voor details.";
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