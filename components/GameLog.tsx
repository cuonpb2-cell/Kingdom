
import React, { useEffect, useRef } from 'react';
import { GameLog as GameLogType, EntityAction } from '../types';

interface GameLogProps {
  logs: GameLogType[];
  isThinking: boolean;
}

const WorldEventCard: React.FC<{ action: EntityAction }> = ({ action }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'War': return '⚔️';
      case 'Diplomacy': return '📜';
      case 'Trade': return '⚖️';
      case 'Expansion': return '🚩';
      default: return '📣';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'War': return 'text-red-400 border-red-900/50 bg-red-950/30';
      case 'Diplomacy': return 'text-blue-400 border-blue-900/50 bg-blue-950/30';
      case 'Trade': return 'text-amber-400 border-amber-900/50 bg-amber-950/30';
      default: return 'text-neutral-400 border-neutral-800 bg-neutral-900/50';
    }
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded border ${getColor(action.actionType)} mb-2 last:mb-0`}>
      <div className="text-xl shrink-0 select-none">{getIcon(action.actionType)}</div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-sm text-neutral-200">{action.entityName}</span>
          <span className="text-[10px] uppercase opacity-70 border border-current px-1 rounded">{action.actionType}</span>
        </div>
        <p className="text-sm text-neutral-300 mt-1 leading-snug">{action.description}</p>
      </div>
    </div>
  );
};

export const GameLog: React.FC<GameLogProps> = ({ logs, isThinking }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isThinking]);

  const renderLogContent = (log: GameLogType) => {
    if (log.type === 'world_event' && log.entityActions && log.entityActions.length > 0) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3 opacity-80">
            <span className="text-lg">🌍</span>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Tin Tức Thế Giới</span>
            <div className="h-px bg-neutral-700 flex-1"></div>
          </div>
          {log.entityActions.map((action, idx) => (
            <WorldEventCard key={idx} action={action} />
          ))}
        </div>
      );
    }
    
    return (
      <>
        {log.type === 'ai' && log.eventTitle && (
          <div className="text-amber-500 font-bold font-display text-base mb-3 border-b border-neutral-700/50 pb-2 flex items-center gap-2">
            <span>✦</span> {log.eventTitle} <span>✦</span>
          </div>
        )}
        <p className="leading-relaxed whitespace-pre-wrap text-base font-serif">{log.content}</p>
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-4">
      {logs.length === 0 && (
        <div className="text-center text-neutral-500 italic mt-20">
          Biên niên sử vương quốc bắt đầu từ đây...
        </div>
      )}
      
      {logs.map((log) => (
        <div 
          key={log.id} 
          className={`flex flex-col animate-fade-in ${log.type === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div 
            className={`max-w-[90%] md:max-w-[85%] rounded-lg p-5 relative shadow-sm ${
              log.type === 'user' 
                ? 'bg-indigo-900/30 border border-indigo-500/30 text-indigo-100 rounded-tr-none' 
                : log.type === 'system'
                ? 'bg-red-900/20 border border-red-800 text-red-200 text-center w-full max-w-full italic'
                : log.type === 'world_event'
                ? 'bg-[#1a1a1a] border border-neutral-700 w-full md:max-w-[85%]'
                : 'bg-neutral-800/80 border border-neutral-700 text-neutral-200 rounded-tl-none'
            }`}
          >
            {renderLogContent(log)}
            
            <div className={`text-[10px] mt-3 opacity-60 font-sans uppercase tracking-wider ${log.type === 'user' ? 'text-right' : 'text-left'}`}>
              {log.type === 'user' ? 'Quốc vương' : log.type === 'world_event' ? 'Hệ thống tin tức' : 'Sử gia'} • {log.timestamp}
            </div>
          </div>
        </div>
      ))}

      {isThinking && (
        <div className="flex items-start animate-pulse">
          <div className="bg-neutral-800/50 border border-neutral-700 text-neutral-400 rounded-lg rounded-tl-none p-4 flex gap-2 items-center">
            <span className="text-xl">📜</span>
            <span className="text-sm font-serif italic">Đang ghi chép lịch sử...</span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
