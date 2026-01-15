
import React from 'react';
import type { CommandSection } from '../types';
import { CommandCard } from './CommandCard';
import { Spinner } from './Spinner';

interface OutputPanelProps {
  data: CommandSection[] | null;
  isLoading: boolean;
  error: string | null;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ data, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <Spinner />
          <p className="mt-4 text-lg">AI is formatting your document...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-400 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p>{error}</p>
        </div>
      );
    }

    if (data) {
      return (
        <div className="space-y-8">
          {data.map((section, index) => (
            <div key={index}>
              <h3 className="text-2xl font-bold text-cyan-400 border-b-2 border-slate-700 pb-2 mb-4">
                {section.title}
              </h3>
              <div className="space-y-4">
                {section.commands.map((cmd, cmdIndex) => (
                  <CommandCard key={cmdIndex} command={cmd.command} description={cmd.description} />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-lg p-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-400">Ready to Organize</h3>
          <p>Your beautifully formatted document will appear here once you click "Fix Document".</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-semibold text-slate-300">Formatted Output</h2>
      <div className="w-full h-96 min-h-[400px] lg:min-h-[500px] p-4 bg-slate-800 border border-slate-700 rounded-lg overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
