
import React from 'react';
import type { AnalyzedReceiptData } from '../types';
import { CalendarIcon, TagIcon, CurrencyDollarIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from './IconComponents';

interface AnalysisResultProps {
  data: AnalyzedReceiptData;
  onSave: () => void;
  onDiscard: () => void;
}

const InfoRow: React.FC<{ icon: React.ReactNode, label: string, value: string | number | null }> = ({ icon, label, value }) => (
  <div className="flex items-start py-3">
    <div className="text-slate-400 mr-3 mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-800">{value || <span className="text-slate-400 italic">Not found</span>}</p>
    </div>
  </div>
);


export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onSave, onDiscard }) => {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-800 text-center">Analysis Complete</h3>
      <p className="text-slate-600 text-center text-sm">Please review the extracted information before saving.</p>
      
      <div className="divide-y divide-blue-100">
        <InfoRow icon={<TagIcon className="h-5 w-5"/>} label="Vendor" value={data.vendor} />
        <InfoRow icon={<CalendarIcon className="h-5 w-5"/>} label="Date" value={data.date} />
        <InfoRow icon={<CurrencyDollarIcon className="h-5 w-5"/>} label="Total Amount" value={data.total !== null ? `$${data.total.toFixed(2)}` : null} />
        <InfoRow icon={<DocumentTextIcon className="h-5 w-5"/>} label="Description" value={data.description} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={onDiscard}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        >
          <XCircleIcon className="w-5 h-5 mr-2" />
          Discard & Start Over
        </button>
        <button
          onClick={onSave}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          Confirm & Save
        </button>
      </div>
    </div>
  );
};
