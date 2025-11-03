
import React from 'react';
import type { Receipt } from '../types';
import { ArchiveBoxIcon } from './IconComponents';

interface ReceiptsTableProps {
  receipts: Receipt[];
}

export const ReceiptsTable: React.FC<ReceiptsTableProps> = ({ receipts }) => {
  if (receipts.length === 0) {
    return (
        <div className="mt-12 text-center">
            <ArchiveBoxIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-800">No Receipts Logged Yet</h3>
            <p className="mt-1 text-sm text-slate-500">Your saved receipts will appear here as a spreadsheet.</p>
        </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-700 mb-4">Logged Expenses</h2>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Car</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
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
                        {receipt.total !== null ? `$${receipt.total.toFixed(2)}` : 'N/A'}
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
      <p className="text-center text-sm text-slate-500 mt-4">This table acts as your local spreadsheet. For a real Google Sheets integration, a backend service would be required.</p>
    </div>
  );
};
