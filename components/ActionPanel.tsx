
import React, { useState } from 'react';
import { ActionType, SuggestedAction } from '../types';

interface ActionPanelProps {
  onAction: (actionType: ActionType, customInput?: string) => void;
  choices: SuggestedAction[];
  disabled: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ onAction, choices, disabled }) => {
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onAction(ActionType.CUSTOM, customInput);
      setCustomInput('');
      setShowCustom(false);
    }
  };

  const getStyleClass = (style?: string) => {
    switch (style) {
      case 'Aggressive':
        return 'hover:bg-red-900/40 border-red-800 text-red-100 hover:border-red-500';
      case 'Diplomatic':
        return 'hover:bg-blue-900/40 border-blue-800 text-blue-100 hover:border-blue-500';
      case 'Economic':
        return 'hover:bg-amber-900/40 border-amber-800 text-amber-100 hover:border-amber-500';
      default:
        return 'hover:bg-neutral-800 border-neutral-700 text-neutral-200 hover:border-neutral-500';
    }
  };

  return (
    <div className="mt-4">
      {/* Dynamic Choices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => onAction(ActionType.CUSTOM, choice.action)}
            disabled={disabled}
            className={`
              group relative p-4 rounded-lg border bg-neutral-900/80 transition-all duration-300
              flex flex-col items-start justify-center gap-1 text-left
              ${getStyleClass(choice.style)}
              ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.01] hover:shadow-lg'}
            `}
          >
            <span className="font-bold font-display text-lg tracking-wide group-hover:underline decoration-white/20 underline-offset-4">
              {choice.label}
            </span>
            <span className="text-xs opacity-60 font-sans line-clamp-1 italic group-hover:opacity-100 transition-opacity">
              {choice.action}
            </span>
            
            {/* Style Indicator Icon */}
            <div className="absolute top-3 right-3 opacity-30 group-hover:opacity-100 transition-opacity text-xl">
               {choice.style === 'Aggressive' && '⚔️'}
               {choice.style === 'Diplomatic' && '🕊️'}
               {choice.style === 'Economic' && '💰'}
               {choice.style === 'Neutral' && '🛡️'}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Input Toggle */}
      <div className="relative">
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            disabled={disabled}
            className={`w-full p-2 rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-500 text-sm font-serif italic hover:bg-neutral-800 hover:text-neutral-300 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ✍️ Nhập hành động tùy ý khác...
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="flex gap-2 animate-fade-in">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="VD: Đàm phán với vương quốc láng giềng..."
              className="flex-1 bg-neutral-900 border border-neutral-600 text-white p-3 rounded-lg focus:outline-none focus:border-amber-500"
              autoFocus
              disabled={disabled}
            />
            <button
              type="submit"
              disabled={disabled || !customInput.trim()}
              className="bg-amber-700 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gửi
            </button>
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg"
            >
              Hủy
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
