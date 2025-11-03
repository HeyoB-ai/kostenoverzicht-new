
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
import { UsersIcon, ChevronDownIcon, ChevronUpIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedData, setAnalyzedData] = useState<AnalyzedReceiptData | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isCarManagerOpen, setIsCarManagerOpen] = useState(false);

  const [cars, setCars] = useState<Car[]>(() => {
    try {
      const storedCars = localStorage.getItem('cars');
      return storedCars ? JSON.parse(storedCars) : INITIAL_CARS;
    } catch (error) {
      console.error("Failed to parse cars from localStorage", error);
      return INITIAL_CARS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cars', JSON.stringify(cars));
    } catch (error) {
      console.error("Failed to save cars to localStorage", error);
    }
  }, [cars]);

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
      if (window.confirm('This will replace your current car list. Are you sure?')) {
        setCars(importedCars);
        alert('Car list imported successfully!');
      }
    } else {
      alert('Invalid import data. Please make sure you copied the correct export text.');
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
      setError('Please select an image and a car.');
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
      setError('Failed to analyze the receipt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!analyzedData || !selectedCarId) return;

    const selectedCar = cars.find(c => c.id === selectedCarId);
    if (!selectedCar) return;

    const newReceipt: Receipt = {
      id: Date.now().toString(),
      car: selectedCar,
      ...analyzedData,
    };

    setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);
    handleReset();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg">
            <button
              onClick={() => setIsCarManagerOpen(!isCarManagerOpen)}
              className="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              aria-expanded={isCarManagerOpen}
              aria-controls="car-manager"
            >
              <div className="flex items-center space-x-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
                <span>Manage Your Cars</span>
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
        </div>


        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-700">Log a New Maintenance Receipt</h2>
            <p className="text-slate-500 mt-1">Upload a photo of a receipt, select the car, and let AI do the rest.</p>
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

          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8">
              <Spinner />
              <p className="text-slate-500 animate-pulse">Analyzing receipt... this may take a moment.</p>
            </div>
          )}

          {error && <div className="text-red-500 bg-red-100 border border-red-400 rounded-md p-3 text-center">{error}</div>}

          {analyzedData && !isLoading && (
            <AnalysisResult 
              data={analyzedData}
              onSave={handleSave}
              onDiscard={handleReset}
            />
          )}
        </div>
        
        <ReceiptsTable receipts={receipts} />
      </main>
    </div>
  );
};

export default App;
