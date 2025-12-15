import React from 'react';
import type { AnalyzedReceiptData } from '../types';
import { CalendarIcon, TagIcon, CurrencyDollarIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from './IconComponents';
import { Spinner } from './Spinner';

interface AnalysisResultProps {
  data: AnalyzedReceiptData;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
}

const InfoRow: React.FC<{ icon: React.ReactNode, label: string, value: string | number | null }> = ({ icon, label, value }) => (
  <div className="flex items-start py-3">
    <div className="text-slate-400 mr-3 mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-800">{value || <span className="text-slate-400 italic">Niet gevonden</span>}</p>
    </div>
  </div>
);


export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onSave, onDiscard, isSaving }) => {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-800 text-center">Analyse voltooid</h3>
      <p className="text-slate-600 text-center text-sm">Controleer de geëxtraheerde informatie voordat u opslaat.</p>
      
      <div className="divide-y divide-blue-100">
        <InfoRow icon={<TagIcon className="h-5 w-5"/>} label="Leverancier" value={data.vendor} />
        <InfoRow icon={<CalendarIcon className="h-5 w-5"/>} label="Datum" value={data.date} />
        <InfoRow icon={<CurrencyDollarIcon className="h-5 w-5"/>} label="Totaalbedrag" value={data.total !== null ? `€${data.total.toFixed(2)}` : null} />
        <InfoRow icon={<DocumentTextIcon className="h-5 w-5"/>} label="Omschrijving" value={data.description} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={onDiscard}
          disabled={isSaving}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          <XCircleIcon className="w-5 h-5 mr-2" />
          Annuleren & opnieuw beginnen
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Opslaan...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Bevestig en sla op
            </>
          )}
        </button>
      </div>
    </div>
  );
};