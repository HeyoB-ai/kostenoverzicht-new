
import React, { useState } from 'react';
import type { Car } from '../types';
import { PlusCircleIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from './IconComponents';

interface CarManagerProps {
  cars: Car[];
  onAddCar: (newCar: Omit<Car, 'id'>) => void;
  onDeleteCar: (carId: string) => void;
  onImportCars: (cars: Car[]) => void;
}

export const CarManager: React.FC<CarManagerProps> = ({ cars, onAddCar, onDeleteCar, onImportCars }) => {
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Export Fleet');


  const handleAddCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && plate.trim()) {
      onAddCar({ name: name.trim(), plate: plate.trim() });
      setName('');
      setPlate('');
    }
  };

  const handleExport = () => {
    if (cars.length === 0) {
        alert("There are no cars to export.");
        return;
    }
    const json = JSON.stringify(cars, null, 2);
    navigator.clipboard.writeText(json).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Export Fleet'), 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Could not copy to clipboard. Your browser might not support this feature.');
    });
  };

  const handleLoadImport = () => {
    try {
        const parsedCars = JSON.parse(importJson);
        onImportCars(parsedCars);
        setIsImporting(false);
        setImportJson('');
    } catch (error) {
        alert('Invalid format. Please paste the exact text you exported.');
        console.error('Import parse error:', error);
    }
  };


  return (
    <div className="space-y-6">
        {/* Import / Export Section */}
        {!isImporting && (
            <div>
                <h3 className="text-lg font-medium text-slate-800">Transfer Your Fleet</h3>
                <p className="text-sm text-slate-500 mb-3">Use these tools to move your car list between devices.</p>
                <div className="flex gap-3">
                    <button onClick={() => setIsImporting(true)} className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50">
                        <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                        Import
                    </button>
                    <button onClick={handleExport} className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50">
                         <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        {copyButtonText}
                    </button>
                </div>
            </div>
        )}

        {isImporting && (
             <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
                 <h3 className="text-lg font-medium text-slate-800">Import Fleet</h3>
                 <p className="text-sm text-slate-600">Paste the exported text below to replace your current list.</p>
                 <textarea
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder="Paste your exported car list here..."
                    className="w-full h-24 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Paste exported car list"
                 />
                 <div className="flex gap-3">
                     <button onClick={() => setIsImporting(false)} className="flex-1 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50">
                         Cancel
                     </button>
                     <button onClick={handleLoadImport} disabled={!importJson.trim()} className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400">
                         Load Fleet
                     </button>
                 </div>
            </div>
        )}

        <hr/>
        
        {/* Car Management Section */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* List of current cars */}
        <div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Your Fleet</h3>
            <div className="max-h-60 overflow-y-auto border rounded-lg">
                {cars.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                    {cars.map(car => (
                    <li key={car.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                        <div>
                        <p className="font-semibold text-slate-800">{car.name}</p>
                        <p className="text-sm text-slate-500">{car.plate}</p>
                        </div>
                        <button
                        onClick={() => onDeleteCar(car.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        aria-label={`Delete ${car.name}`}
                        >
                        <TrashIcon className="h-5 w-5" />
                        </button>
                    </li>
                    ))}
                </ul>
                ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                    <p>You haven't added any cars yet.</p>
                    <p>Use the form to add your first car, or import a list.</p>
                </div>
                )}
            </div>
        </div>
        
        {/* Form to add a new car */}
        <div>
            <h3 className="text-lg font-medium text-slate-800">Add a New Car</h3>
            <form onSubmit={handleAddCar} className="mt-2 space-y-3">
            <div>
                <label htmlFor="car-name" className="sr-only">Car Name</label>
                <input
                id="car-name"
                type="text"
                placeholder="Car Name (e.g., Toyota Corolla)"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label htmlFor="car-plate" className="sr-only">License Plate</label>
                <input
                id="car-plate"
                type="text"
                placeholder="License Plate (e.g., AB-123-CD)"
                value={plate}
                onChange={e => setPlate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
                disabled={!name.trim() || !plate.trim()}
            >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Add Car to Fleet
            </button>
            </form>
        </div>
        </div>
    </div>
  );
};
