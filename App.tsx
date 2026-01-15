
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { formatDocument } from './services/geminiService';
import type { CommandSection } from './types';
import { INITIAL_DOCUMENT } from './constants';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>(INITIAL_DOCUMENT);
  const [formattedData, setFormattedData] = useState<CommandSection[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFixDocument = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Input document cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setFormattedData(null);

    try {
      const result = await formatDocument(inputText);
      setFormattedData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to format document. Please check the console for more details.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputPanel
            inputText={inputText}
            setInputText={setInputText}
            onFix={handleFixDocument}
            isLoading={isLoading}
          />
          <OutputPanel
            data={formattedData}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
