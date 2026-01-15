
import React from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  onFix: () => void;
  isLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  setInputText,
  onFix,
  isLoading,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-semibold text-slate-300">Input Document</h2>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste your messy document here..."
        className="w-full h-96 min-h-[400px] lg:min-h-[500px] p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-y font-mono text-sm"
        disabled={isLoading}
      />
      <button
        onClick={onFix}
        disabled={isLoading || !inputText.trim()}
        className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95 shadow-lg shadow-cyan-900/50 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <MagicWandIcon className="w-5 h-5 mr-2" />
            Fix Document
          </>
        )}
      </button>
    </div>
  );
};
