
import React, { useState } from 'react';
import { WorldInfo, GameSettings, KingdomStats } from '../types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  stats: KingdomStats;
  worldInfo: WorldInfo;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, settings, stats, worldInfo }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'entities' | 'people' | 'rumors'>('overview');

  if (!isOpen) return null;

  const getRumorVisuals = (type: string) => {
    switch (type) {
      case 'Threat': return { icon: '⚠️', bg: 'bg-red-900/30', border: 'border-red-700/50', text: 'text-red-300' };
      case 'Opportunity': return { icon: '✨', bg: 'bg-amber-900/30', border: 'border-amber-700/50', text: 'text-amber-300' };
      case 'Mystery': return { icon: '🔮', bg: 'bg-purple-900/30', border: 'border-purple-700/50', text: 'text-purple-300' };
      case 'Talent': return { icon: '🎓', bg: 'bg-cyan-900/30', border: 'border-cyan-700/50', text: 'text-cyan-300' };
      default: return { icon: '💬', bg: 'bg-neutral-800/40', border: 'border-neutral-700', text: 'text-neutral-300' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-amber-700/50 w-full max-w-2xl max-h-[80vh] rounded-xl flex flex-col shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-950 rounded-t-xl">
          <h2 className="text-xl font-display text-amber-500">Hồ Sơ Vương Quốc</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors text-xl">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Tổng Quan' },
            { id: 'entities', label: 'Ngoại Giao' },
            { id: 'people', label: 'Nhân Vật' },
            { id: 'rumors', label: 'Tin Đồn & Sự Kiện' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-amber-900/20 text-amber-500 border-b-2 border-amber-500' 
                  : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700">
                <h3 className="text-lg font-bold text-white mb-2">{settings.kingdomName}</h3>
                <p className="text-neutral-300 text-sm italic mb-2">Lãnh đạo: {settings.leaderName}</p>
                <p className="text-neutral-400 text-sm">{settings.background}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800 p-3 rounded border border-neutral-700">
                  <span className="text-xs text-neutral-500 block">Thế giới</span>
                  <span className="text-neutral-200">{settings.worldTheme}</span>
                </div>
                <div className="bg-neutral-800 p-3 rounded border border-neutral-700">
                  <span className="text-xs text-neutral-500 block">Thời gian trị vì</span>
                  <span className="text-neutral-200">{stats.year} Năm, {stats.month} Tháng</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="space-y-3">
              {worldInfo.entities.length === 0 ? (
                <p className="text-neutral-500 italic text-center py-8">Chưa phát hiện thế lực nào khác.</p>
              ) : (
                worldInfo.entities.map(entity => (
                  <div key={entity.id} className="bg-neutral-800/40 p-3 rounded border border-neutral-700 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-indigo-300">{entity.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${
                        entity.relation === 'Hostile' ? 'bg-red-900/50 text-red-300' :
                        entity.relation === 'Ally' ? 'bg-green-900/50 text-green-300' :
                        entity.relation === 'Friendly' ? 'bg-blue-900/50 text-blue-300' :
                        'bg-neutral-700 text-neutral-400'
                      }`}>{entity.relation}</span>
                    </div>
                    <span className="text-xs text-neutral-500 uppercase">{entity.type}</span>
                    <p className="text-sm text-neutral-300">{entity.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-3">
              {worldInfo.people.length === 0 ? (
                <p className="text-neutral-500 italic text-center py-8">Chưa có nhân vật nổi bật nào.</p>
              ) : (
                worldInfo.people.map(person => (
                  <div key={person.id} className="flex items-start gap-3 bg-neutral-800/40 p-3 rounded border border-neutral-700">
                    <div className="bg-neutral-700 w-10 h-10 rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-100">{person.name}</h4>
                      <div className="text-xs text-amber-500/80 mb-1">{person.role} • {person.status === 'Alive' ? 'Còn sống' : 'Đã chết'}</div>
                      <p className="text-sm text-neutral-400">{person.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rumors' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 mb-2 italic">
                * Tin đồn có thể là cơ hội hoặc mối đe dọa. Hãy xử lý chúng trong bảng hành động hoặc lờ đi để xem kết quả.
              </p>
              {worldInfo.rumors.filter(r => !r.isResolved).length === 0 ? (
                <p className="text-neutral-500 italic text-center py-8">Không có tin đồn nào đang lưu truyền.</p>
              ) : (
                worldInfo.rumors.filter(r => !r.isResolved).map(rumor => {
                  const visuals = getRumorVisuals(rumor.type);
                  return (
                    <div key={rumor.id} className={`p-4 rounded-lg border ${visuals.bg} ${visuals.border} relative group`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                           <span className="text-lg">{visuals.icon}</span>
                           <span className={`font-bold text-sm ${visuals.text} uppercase tracking-wide`}>
                             {rumor.type || 'Gossip'}
                           </span>
                        </div>
                        {rumor.possibleImpact && (
                           <span className="text-[10px] bg-black/40 px-2 py-1 rounded text-neutral-300 font-mono border border-white/10">
                             {rumor.possibleImpact}
                           </span>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-neutral-200 text-base mb-1">
                        {rumor.title || 'Tin đồn vô danh'}
                      </h4>
                      <p className="text-sm text-neutral-300 leading-relaxed">
                        {rumor.content}
                      </p>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] text-neutral-500">ID: {rumor.id}</span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Resolved Rumors History */}
              {worldInfo.rumors.some(r => r.isResolved) && (
                <div className="mt-8 pt-4 border-t border-neutral-800">
                  <h4 className="text-xs font-bold text-neutral-600 uppercase mb-3">Tin đồn đã giải quyết</h4>
                  <div className="space-y-2 opacity-60">
                     {worldInfo.rumors.filter(r => r.isResolved).slice(-3).map(rumor => (
                       <div key={rumor.id} className="text-xs flex gap-2 items-center text-neutral-500">
                         <span>✓</span>
                         <span className="line-through">{rumor.title || rumor.content.substring(0, 30)}</span>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};