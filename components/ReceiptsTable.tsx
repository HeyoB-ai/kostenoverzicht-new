import React from 'react';
import type { Receipt } from '../types';
import { ArchiveBoxIcon } from './IconComponents';

interface ReceiptsTableProps {
  receipts: Receipt[];
}

export const ReceiptsTable: React.FC<ReceiptsTableProps> = ({ receipts }) => {
  const handleExport = () => {
    if (receipts.length === 0) {
      alert("Er zijn geen bonnetjes om te exporteren.");
      return;
    }
    
    const headers = ["Auto Naam", "Kenteken", "Datum", "Leverancier", "Omschrijving", "Totaal"];
    const rows = receipts.map(r => [
      r.car.name,
      r.car.plate,
      r.date || '',
      r.vendor || '',
      `"${(r.description || '').replace(/"/g, '""')}"`, // Handle quotes in description
      r.total !== null ? r.total.toFixed(2) : ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bonnetjes_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (receipts.length === 0) {
    return (
        <div className="mt-12 text-center">
            <ArchiveBoxIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-800">Nog geen bonnetjes gelogd</h3>
            <p className="mt-1 text-sm text-slate-500">Uw opgeslagen bonnetjes verschijnen hier.</p>
        </div>
    );
  }

  return (
    <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-700">Geregistreerde uitgaven</h2>
            <button
                onClick={handleExport}
                className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
            >
                Exporteer naar CSV
            </button>
        </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Auto</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Datum</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Leverancier</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Omschrijving</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Totaal</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {receipts.map((receipt) => (
                    <tr key={receipt.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{receipt.car.name}</div>
                            <div className="text-sm text-slate-500">{receipt.car.plate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{receipt.date || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{receipt.vendor || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-slate-500 max-w-xs">{receipt.description || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-slate-900">
                        {receipt.total !== null ? `€${receipt.total.toFixed(2)}` : 'N/A'}
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
      <p className="text-center text-sm text-slate-500 mt-4">Bonnetjes worden automatisch opgeslagen in uw gekoppelde Google Sheet (indien geconfigureerd in Instellingen).</p>
    </div>
  );
};