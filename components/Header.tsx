
import React from 'react';
import { WrenchScrewdriverIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center space-x-3">
        <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-800">
          Car Maintenance Logger
        </h1>
      </div>
    </header>
  );
};
