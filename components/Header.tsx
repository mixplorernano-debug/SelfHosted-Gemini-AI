
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 border-b border-slate-700/50">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Document Fixer AI
        </h1>
        <p className="mt-2 text-slate-400">
          Instantly clean up and structure your text with the power of AI.
        </p>
      </div>
    </header>
  );
};
