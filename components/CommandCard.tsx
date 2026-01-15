
import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CommandCardProps {
  command: string;
  description: string;
}

export const CommandCard: React.FC<CommandCardProps> = ({ command, description }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700/80 rounded-lg p-4 transition-shadow hover:shadow-lg hover:shadow-cyan-900/30">
      <div className="flex justify-between items-start gap-2">
        <code className="flex-1 text-cyan-300 bg-slate-800 px-3 py-2 rounded font-mono text-sm break-all">
          {command}
        </code>
        <button
          onClick={handleCopy}
          className={`p-2 rounded-md transition-colors duration-200 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
          aria-label={copied ? 'Copied' : 'Copy command'}
        >
          {copied ? (
            <CheckIcon className="w-5 h-5" />
          ) : (
            <CopyIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="mt-3 text-slate-400 text-sm whitespace-pre-wrap">{description.replace(/•\s?/g, '')}</p>
    </div>
  );
};
