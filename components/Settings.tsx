import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from './IconComponents';

interface SettingsProps {
  scriptUrl: string;
  onSave: (url: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ scriptUrl, onSave }) => {
  const [currentUrl, setCurrentUrl] = useState(scriptUrl);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Kopieer Code');


  useEffect(() => {
    setCurrentUrl(scriptUrl);
  }, [scriptUrl]);

  const handleSave = () => {
    onSave(currentUrl);
    alert('Instellingen opgeslagen!');
  };
  
  const appsScriptCode = `
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Bonnetjes");
    
    // Create header row if sheet is empty
    if (sheet.getLastRow() == 0) {
      sheet.appendRow(["Auto Naam", "Kenteken", "Datum", "Leverancier", "Omschrijving", "Totaal", "Timestamp"]);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    var carName = data.carName || 'N/A';
    var carPlate = data.carPlate || 'N/A';
    var date = data.date || 'N/A';
    var vendor = data.vendor || 'N/A';
    var description = data.description || 'N/A';
    var total = data.total || 0;
    
    sheet.appendRow([carName, carPlate, date, vendor, description, total, new Date()]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
  `.trim();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode).then(() => {
      setCopyButtonText('Gekopieerd!');
      setTimeout(() => setCopyButtonText('Kopieer Code'), 2000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
      alert('Kopiëren mislukt.');
    });
  };

  return (
    <div className="space-y-8">
      {/* Google Sheets Section */}
      <div>
        <h3 className="text-lg font-medium text-slate-800">Google Apps Script URL (Optioneel)</h3>
        <p className="text-sm text-slate-500 mb-2">Plak hier de URL van uw Web App-script om bonnetjes automatisch op te slaan in uw Google Sheet.</p>
        <input
            type="url"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-2"
        />
        
        <div className="bg-slate-50 rounded-lg border border-slate-200 mt-4">
            <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex justify-between items-center p-3 text-left font-medium text-slate-600 hover:bg-slate-100"
            aria-expanded={showInstructions}
            >
            <span>Hoe stel ik Google Sheets in? (Klik voor instructies)</span>
            {showInstructions ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5 text-slate-500" />}
            </button>

            {showInstructions && (
            <div className="p-4 border-t border-slate-200 space-y-4 text-sm text-slate-700">
                <p className="font-semibold">Volg deze 5 stappen om de koppeling te maken:</p>
                <ol className="list-decimal list-inside space-y-3">
                <li>
                    <strong>Maak een Google Sheet aan.</strong> Ga naar <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">sheets.new</a>, geef uw spreadsheet een naam (bijv. "Auto Onderhoud") en maak een tabblad (sheet) met de naam <strong className="bg-slate-200 px-1 rounded-md">Bonnetjes</strong>.
                </li>
                <li>
                    <strong>Open de Script Editor.</strong> Ga in uw spreadsheet naar `Extensies` &gt; `Apps Script`.
                </li>
                <li>
                    <strong>Plak de code.</strong> Verwijder alle bestaande code in het `Code.gs` bestand en plak de onderstaande code erin.
                    <div className="mt-2 bg-slate-800 text-white p-3 rounded-md relative">
                        <pre className="whitespace-pre-wrap break-all text-xs"><code>{appsScriptCode}</code></pre>
                        <button onClick={handleCopyCode} className="absolute top-2 right-2 bg-slate-600 hover:bg-slate-500 text-white text-xs font-semibold py-1 px-2 rounded">{copyButtonText}</button>
                    </div>
                </li>
                <li>
                    <strong>Implementeer als Web App.</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>Klik rechtsboven op de blauwe knop <strong className="bg-slate-200 px-1 rounded-md">Implementeren</strong> en kies <strong className="bg-slate-200 px-1 rounded-md">Nieuwe implementatie</strong>.</li>
                        <li>Klik op het tandwiel-icoon (`Selecteer type`) en kies <strong className="bg-slate-200 px-1 rounded-md">Web-app</strong>.</li>
                        <li>Bij 'Wie heeft toegang', selecteer <strong className="bg-slate-200 px-1 rounded-md">Iedereen</strong>. <span className="italic">(Dit is nodig zodat de app data kan sturen. Alleen degenen met de unieke URL kunnen data posten).</span></li>
                        <li>Klik op <strong className="bg-slate-200 px-1 rounded-md">Implementeren</strong>.</li>
                        <li>Geef Google toestemming om het script uit te voeren. U moet mogelijk op "Geavanceerd" klikken en "Ga naar [projectnaam] (onveilig)" kiezen. Dit is veilig, omdat u de code zelf heeft geplakt.</li>
                    </ul>
                </li>
                <li>
                    <strong>Kopieer de Web App URL.</strong> Na de implementatie krijgt u een URL te zien. Kopieer deze <strong className="bg-slate-200 px-1 rounded-md">Web-app-URL</strong>, plak hem in het veld hierboven en klik op 'Opslaan'. Klaar!
                </li>
                </ol>
            </div>
            )}
        </div>
      </div>
      
      <div className="pt-4">
        <button
            onClick={handleSave}
            className="w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Instellingen Opslaan
        </button>
      </div>
    </div>
  );
};