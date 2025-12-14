import React, { useState } from 'react';
import { KingdomHeritage, GameSettings, Person } from '../types';

interface PoliticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  heritage: KingdomHeritage;
}

export const PoliticsModal: React.FC<PoliticsModalProps> = ({ isOpen, onClose, settings, heritage }) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'genealogy'>('hierarchy');

  if (!isOpen) return null;

  // Helper to categorize family members
  const getFamilyGroups = () => {
    const family = heritage.royalFamily;
    return {
      parents: family.filter(p => p.familyRelation === 'Parent'),
      siblings: family.filter(p => p.familyRelation === 'Sibling'),
      self: family.find(p => p.familyRelation === 'Self'),
      spouses: family.filter(p => p.familyRelation === 'Spouse'),
      children: family.filter(p => p.familyRelation === 'Child'),
      others: family.filter(p => 
        !['Parent', 'Sibling', 'Self', 'Spouse', 'Child'].includes(p.familyRelation || '')
      )
    };
  };

  const { parents, siblings, self, spouses, children, others } = getFamilyGroups();

  const renderPersonCard = (person: Person, isMain: boolean = false) => (
    <div 
      key={person.id}
      className={`
        relative flex flex-col items-center p-3 rounded-lg border shadow-lg transition-transform hover:scale-105
        ${person.status === 'Dead' 
          ? 'bg-neutral-800 border-neutral-700 opacity-70 grayscale' 
          : isMain 
            ? 'bg-amber-900/40 border-amber-500 ring-1 ring-amber-500/50' 
            : 'bg-neutral-800 border-neutral-600'
        }
        min-w-[140px] max-w-[180px]
      `}
    >
      {person.status === 'Dead' && (
        <span className="absolute -top-2 -right-2 text-xl filter grayscale-0">⚰️</span>
      )}
      
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 border-2
        ${isMain ? 'bg-amber-700 border-amber-400' : 'bg-neutral-700 border-neutral-500'}
      `}>
        {isMain ? '👑' : '👤'}
      </div>

      <div className="text-center w-full">
        <h4 className={`text-sm font-bold truncate w-full ${isMain ? 'text-amber-400' : 'text-neutral-200'}`}>
          {person.name}
        </h4>
        <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 truncate">
          {person.role}
        </div>
        <div className="text-[10px] bg-neutral-900/50 rounded px-2 py-0.5 inline-block text-neutral-500">
          {person.age} tuổi
        </div>
      </div>

      {/* Hover Tooltip for details */}
      <div className="absolute opacity-0 hover:opacity-100 top-full mt-2 left-1/2 -translate-x-1/2 z-20 w-48 bg-black/90 border border-neutral-600 p-2 rounded text-xs text-neutral-300 pointer-events-none transition-opacity">
        <p className="font-bold text-amber-500 mb-1">{person.personality}</p>
        <p className="italic">"{person.description}"</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-red-900/50 w-full max-w-5xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-red-900/30 bg-neutral-950 rounded-t-xl relative">
          <div className="absolute inset-0 bg-red-900/10 pointer-events-none"></div>
          <h2 className="text-xl font-display text-red-500 z-10 flex items-center gap-2">
            <span>🏛️</span> Hệ Thống Chính Trị
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors text-xl z-10">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'hierarchy' 
                ? 'bg-red-900/20 text-red-500 border-b-2 border-red-500' 
                : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
            }`}
          >
            Lãnh Thổ & Chư Hầu
          </button>
          <button
            onClick={() => setActiveTab('genealogy')}
            className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'genealogy' 
                ? 'bg-red-900/20 text-red-500 border-b-2 border-red-500' 
                : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
            }`}
          >
            Gia Phả
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[#1a1614] relative">
          {/* Background pattern for Genealogy */}
          {activeTab === 'genealogy' && (
             <div className="absolute inset-0 opacity-5 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
             </div>
          )}

          {activeTab === 'hierarchy' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-display text-amber-500">{settings.kingdomName}</h3>
                <p className="text-neutral-500 text-sm">Vương Quốc Trung Ương</p>
              </div>

              {heritage.divisions.length === 0 ? (
                <p className="text-neutral-500 italic text-center">Chưa có thông tin về phân cấp hành chính.</p>
              ) : (
                <div className="grid gap-4">
                  {heritage.divisions.map((div) => (
                    <div key={div.id} className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-2 hover:border-red-800/50 transition-colors shadow-md">
                      <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">
                                {div.type === 'Capital' ? '👑' : div.type === 'Duchy' ? '🛡️' : '🚩'}
                            </span>
                            <h4 className="text-lg font-bold text-neutral-200">{div.name}</h4>
                        </div>
                        <p className="text-xs text-red-400 uppercase font-semibold mt-1">{div.type}</p>
                        <p className="text-sm text-neutral-400 mt-1">{div.description}</p>
                      </div>
                      <div className="md:text-right w-full md:w-auto mt-2 md:mt-0 bg-neutral-900/50 p-2 rounded border border-neutral-800">
                        <span className="text-xs text-neutral-500 block">Người cai trị</span>
                        <span className="text-neutral-200 font-serif italic">{div.rulerName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'genealogy' && (
            <div className="flex flex-col items-center gap-8 min-w-max pb-10">
              {heritage.royalFamily.length === 0 ? (
                <p className="text-neutral-500 italic text-center mt-10">Gia phả chưa được thiết lập.</p>
              ) : (
                <>
                  {/* GENERATION 1: PARENTS */}
                  {parents.length > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="flex gap-8">
                        {parents.map(p => renderPersonCard(p))}
                      </div>
                      {/* Line down to next gen */}
                      <div className="h-8 w-px bg-neutral-600 mt-2"></div>
                    </div>
                  )}

                  {/* GENERATION 2: SELF, SPOUSE, SIBLINGS */}
                  <div className="flex flex-col items-center relative">
                    {/* Horizontal connector line for siblings and self */}
                    {(siblings.length > 0) && (
                        <div className="absolute top-[-1px] left-10 right-10 h-px bg-neutral-600 -z-10"></div>
                    )}
                    
                    <div className="flex gap-12 items-start">
                      {/* Siblings Left */}
                      {siblings.length > 0 && (
                        <div className="flex gap-4 pt-4 relative">
                           {/* Connector up to parent line */}
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-px bg-neutral-600"></div>
                           {siblings.map(s => renderPersonCard(s))}
                        </div>
                      )}

                      {/* MAIN COUPLE (Self + Spouses) */}
                      <div className="flex flex-col items-center">
                          {/* Connector up to parent line (if parents exist) */}
                          {parents.length > 0 && <div className="h-4 w-px bg-neutral-600 -mt-2 mb-2"></div>}
                          
                          <div className="flex items-center gap-2 p-4 bg-neutral-900/30 rounded-xl border border-dashed border-neutral-800">
                            {self && renderPersonCard(self, true)}
                            {spouses.length > 0 && (
                                <>
                                  <div className="h-px w-6 bg-amber-700/50"></div>
                                  <div className="text-xl text-amber-700">❤</div>
                                  <div className="h-px w-6 bg-amber-700/50"></div>
                                  <div className="flex gap-2">
                                      {spouses.map(s => renderPersonCard(s))}
                                  </div>
                                </>
                            )}
                          </div>
                      </div>
                    </div>
                  </div>

                  {/* GENERATION 3: CHILDREN */}
                  {children.length > 0 && (
                    <div className="flex flex-col items-center">
                      {/* Line down from couple */}
                      <div className="h-8 w-px bg-neutral-600"></div>
                      
                      {/* Horizontal line spanning children */}
                      <div className="relative flex gap-8 pt-4">
                         {children.length > 1 && (
                            <div className="absolute top-0 left-10 right-10 h-px bg-neutral-600"></div>
                         )}
                         {/* Little vertical connectors for each child */}
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-px bg-neutral-600"></div>

                         {children.map(child => (
                           <div key={child.id} className="flex flex-col items-center relative">
                             {children.length > 1 && <div className="absolute -top-4 h-4 w-px bg-neutral-600"></div>}
                             {renderPersonCard(child)}
                           </div>
                         ))}
                      </div>
                    </div>
                  )}

                  {/* OTHERS / UNCATEGORIZED */}
                  {others.length > 0 && (
                    <div className="mt-8 border-t border-neutral-800 pt-6 w-full flex flex-col items-center">
                      <h4 className="text-neutral-500 uppercase tracking-widest text-xs mb-4">Thành viên khác / Họ hàng xa</h4>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {others.map(p => renderPersonCard(p))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};