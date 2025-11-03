
import React from 'react';
import type { Car } from '../types';
import { CameraIcon, CarIcon, SparklesIcon } from './IconComponents';

interface ReceiptUploaderProps {
  imagePreview: string | null;
  selectedCarId: string;
  cars: Car[];
  onImageChange: (file: File | null) => void;
  onCarChange: (carId: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  imagePreview,
  selectedCarId,
  cars,
  onImageChange,
  onCarChange,
  onAnalyze,
  isLoading,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageChange(file);
  };
  
  const canAnalyze = !!imagePreview && !!selectedCarId && !isLoading;

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      {/* Step 1 & 2: Upload and Select Car */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div>
          <label className="text-lg font-semibold text-slate-700 flex items-center">
            <span className="bg-blue-600 text-white rounded-full h-6 w-6 text-sm flex items-center justify-center mr-2">1</span>
            Upload Receipt Photo
          </label>
          <div className="mt-2">
            <label htmlFor="file-upload" className="cursor-pointer group">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Receipt preview" className="max-h-48 mx-auto rounded-md shadow-sm"/>
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <CameraIcon className="w-12 h-12 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="mt-2 text-sm font-medium">Click to upload or take a photo</span>
                    <span className="text-xs">PNG, JPG up to 10MB</span>
                  </div>
                )}
              </div>
            </label>
            <input id="file-upload" name="file-upload" type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFileChange} />
          </div>
        </div>
        
        {/* Step 2 */}
        <div>
          <label htmlFor="car-select" className="text-lg font-semibold text-slate-700 flex items-center">
            <span className="bg-blue-600 text-white rounded-full h-6 w-6 text-sm flex items-center justify-center mr-2">2</span>
            Assign to a Car
          </label>
          <div className="mt-2 relative">
             <CarIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="car-select"
              value={selectedCarId}
              onChange={(e) => onCarChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              disabled={cars.length === 0}
            >
              <option value="" disabled>{cars.length === 0 ? 'Please add a car first' : 'Select a car...'}</option>
              {cars.map(car => (
                <option key={car.id} value={car.id}>{car.name} - {car.plate}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Step 3: Analyze */}
      <div className="bg-slate-50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-full">
         <h3 className="text-lg font-semibold text-slate-700 flex items-center">
            <span className="bg-blue-600 text-white rounded-full h-6 w-6 text-sm flex items-center justify-center mr-2">3</span>
            Analyze and Save
          </h3>
          <p className="text-slate-500 text-sm mt-2 mb-4">Click the button to let the AI extract the receipt details.</p>
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          {isLoading ? 'Analyzing...' : 'Analyze Receipt'}
        </button>
      </div>
    </div>
  );
};
