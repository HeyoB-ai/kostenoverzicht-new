import React, { useState, useCallback, useEffect } from 'react';
import { INITIAL_CARS } from './constants';
import type { Car, Receipt, AnalyzedReceiptData } from './types';
import { analyzeReceipt } from './services/geminiService';
import { Header } from './components/Header';
import { ReceiptUploader } from './components/ReceiptUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { ReceiptsTable } from './components/ReceiptsTable';
import { Spinner } from './components/Spinner';
import { CarManager } from './components/CarManager';
import { Settings } from './components/Settings';
import { UsersIcon, ChevronDownIcon, ChevronUpIcon, Cog6ToothIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedData, setAnalyzedData] = useState<AnalyzedReceiptData | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isCarManagerOpen, setIsCarManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [cars, setCars] = useState<Car[]>(() => {
    try {
      const storedCars = localStorage.getItem('cars');
      return storedCars ? JSON.parse(storedCars) : INITIAL_CARS;
    } catch (error) {
      console.error("Failed to parse cars from localStorage", error);
      return INITIAL_CARS;
    }
  });

  const [googleScriptUrl, setGoogleScriptUrl] = useState<string>(() => {
    return localStorage.getItem('googleScriptUrl') || '';
  });

  useEffect(() => {
    try {
      localStorage.setItem('cars', JSON.stringify(cars));
    } catch (error) {
      console.error("Failed to save cars to localStorage", error);
    }
  }, [cars]);

  useEffect(() => {
    localStorage.setItem('googleScriptUrl', googleScriptUrl);
  }, [googleScriptUrl]);


  const handleAddCar = (newCarData: Omit<Car, 'id'>) => {
    const newCar: Car = {
      ...newCarData,
      id: `car-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    setCars(prevCars => [...prevCars, newCar]);
  };

  const handleDeleteCar = (carId: string) => {
    setCars(prevCars => prevCars.filter(car => car.id !== carId));
    if (selectedCarId === carId) {
      setSelectedCarId('');
    }
  };

  const handleImportCars = (importedCars: Car[]) => {
    if (Array.isArray(importedCars) && importedCars.every(c => 'id' in c && 'name' in c && 'plate' in c)) {
      if (window.confirm('Dit vervangt uw huidige autolijst. Weet u het zeker?')) {
        setCars(importedCars);
        alert('Autolijst succesvol geïmporteerd!');
      }
    } else {
      alert('Ongeldige importgegevens. Zorg ervoor dat u de juiste exporttekst hebt gekopieerd.');
    }
  };


  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalyzedData(null); // Reset analysis if new image is uploaded
      setError(null);
    }
  };

  const handleReset = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setSelectedCarId('');
    setIsLoading(false);
    setError(null);
    setAnalyzedData(null);
  }, []);

  const handleAnalyze = async () => {
    if (!imageFile || !selectedCarId) {
      setError('Selecteer een afbeelding en een auto.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalyzedData(null);

    try {
      const data = await analyzeReceipt(imageFile);
      setAnalyzedData(data);
    } catch (err) {
      console.error(err);
      setError('Analyse van het bonnetje is mislukt. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!analyzedData || !selectedCarId) return;

    const selectedCar = cars.find(c => c.id === selectedCarId);
    if (!selectedCar) return;
    
    setIsLoading(true); // Indicate saving process
    setError(null);

    const newReceipt: Receipt = {
      id: Date.now().toString(),
      car: selectedCar,
      ...analyzedData,
    };
    
    if (googleScriptUrl) {
       try {
        const payload = {
          carName: selectedCar.name,
          carPlate: selectedCar.plate,
          date: analyzedData.date || '',
          vendor: analyzedData.vendor || '',
          description: analyzedData.description || '',
          total: analyzedData.total || 0,
        };

        // We use 'no-cors' mode because Apps Script web apps have tricky CORS policies.
        // This means we send the data but can't read the response to confirm success.
        // We assume it succeeds if the fetch doesn't throw a network error.
        await fetch(googleScriptUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (err) {
        console.error(err);
        setError('Fout bij verzenden naar Google Sheets. Het bonnetje is wel lokaal opgeslagen.');
        // We don't stop; we'll still save locally as a fallback.
      }
    }
    
    setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);
    alert('Bonnetje opgeslagen!');
    handleReset();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="space-y-4 mb-8">
          {/* Car Manager */}
          <div className="bg-white rounded-xl shadow-lg">
            <button
              onClick={() => setIsCarManagerOpen(!isCarManagerOpen)}
              className="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              aria-expanded={isCarManagerOpen}
              aria-controls="car-manager"
            >
              <div className="flex items-center space-x-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
                <span>Beheer uw auto's</span>
              </div>
              {isCarManagerOpen ? <ChevronUpIcon className="h-5 w-5 text-slate-500" /> : <ChevronDownIcon className="h-5 w-5 text-slate-500" />}
            </button>
            {isCarManagerOpen && (
              <div id="car-manager" className="p-4 md:p-6 border-t border-slate-200 animate-fade-in">
                <CarManager
                  cars={cars}
                  onAddCar={handleAddCar}
                  onDeleteCar={handleDeleteCar}
                  onImportCars={handleImportCars}
                />
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-lg">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              aria-expanded={isSettingsOpen}
              aria-controls="settings"
            >
              <div className="flex items-center space-x-3">
                <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
                <span>Instellingen (Google Sheets Koppeling)</span>
              </div>
              {isSettingsOpen ? <ChevronUpIcon className="h-5 w-5 text-slate-500" /> : <ChevronDownIcon className="h-5 w-5 text-slate-500" />}
            </button>
            {isSettingsOpen && (
              <div id="settings" className="p-4 md:p-6 border-t border-slate-200 animate-fade-in">
                <Settings
                  scriptUrl={googleScriptUrl}
                  onSave={setGoogleScriptUrl}
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-700">Nieuw onderhoudsbonnetje loggen</h2>
            <p className="text-slate-500 mt-1">Upload een foto van een bonnetje, selecteer de auto en laat de AI de rest doen.</p>
          </div>

          {!analyzedData && (
            <ReceiptUploader
              imagePreview={imagePreview}
              selectedCarId={selectedCarId}
              cars={cars}
              onImageChange={handleImageChange}
              onCarChange={setSelectedCarId}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
          )}

          {isLoading && !analyzedData && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8">
              <Spinner />
              <p className="text-slate-500 animate-pulse">Bonnetje analyseren... dit kan even duren.</p>
            </div>
          )}

          {error && <div className="text-red-500 bg-red-100 border border-red-400 rounded-md p-3 text-center">{error}</div>}

          {analyzedData && (
            <AnalysisResult 
              data={analyzedData}
              onSave={handleSave}
              onDiscard={handleReset}
              isSaving={isLoading}
            />
          )}
        </div>
        
        <ReceiptsTable receipts={receipts} />
      </main>
    </div>
  );
};

export default App;