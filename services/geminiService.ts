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

export const analyzeReceipt = async (imageFile: File): Promise<AnalyzedReceiptData> => {
  // Converteer de afbeelding naar base64 voor verzending
  const base64Data = await fileToBase64(imageFile);

  // Roep de veilige Netlify backend functie aan
  const response = await fetch('/.netlify/functions/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Data,
      mimeType: imageFile.type,
    }),
  });

  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    let errorMessage = `Er is een fout opgetreden (Status: ${response.status})`;
    
    // Probeer de JSON error body te lezen
    if (contentType && contentType.includes("application/json")) {
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Fallback als json parsen mislukt
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