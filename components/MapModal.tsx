import React from 'react';
import { WorldMap, WorldInfo, GameSettings } from '../types';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapData: WorldMap | null;
  worldInfo: WorldInfo;
  settings: GameSettings;
}

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, mapData, worldInfo, settings }) => {
  if (!isOpen) return null;

  // Helper to get color info for a cell ID
  const getCellVisuals = (id: string) => {
    // Ocean
    if (id === '~') return { background: '#172554', isVassal: false }; // Ocean
    
    // Player
    if (id === 'P') return { background: '#d97706', isVassal: false }; // Player
    
    // Entities
    const entity = worldInfo.entities.find(e => e.id === id);
    if (!entity) return { background: '#172554', isVassal: false };

    // Check vassalage
    if (entity.liegeId) {
      const liege = worldInfo.entities.find(e => e.id === entity.liegeId);
      // If player is liege
      const liegeColor = entity.liegeId === 'P' ? '#d97706' : (liege ? liege.color : '#333');
      const vassalColor = entity.color;

      // Create DIAGONAL stripes (45deg)
      // alternating between vassal color and liege color
      return {
        background: `repeating-linear-gradient(
          45deg,
          ${vassalColor},
          ${vassalColor} 4px,
          ${liegeColor} 4px,
          ${liegeColor} 8px
        )`,
        isVassal: true,
        liegeName: entity.liegeId === 'P' ? settings.kingdomName : (liege?.name || 'Unknown')
      };
    }

    return { background: entity.color, isVassal: false };
  };

  const getCellName = (id: string) => {
    if (id === '~') return "Đại dương sâu thẳm";
    if (id === 'P') return settings.kingdomName + " (Bạn)";
    
    const entity = worldInfo.entities.find(e => e.id === id);
    if (!entity) return "Vùng đất bí ẩn";
    
    let name = `${entity.name} (${entity.type})`;
    if (entity.liegeId) {
       const liege = worldInfo.entities.find(e => e.id === entity.liegeId);
       const liegeName = entity.liegeId === 'P' ? settings.kingdomName : (liege?.name || 'Unknown');
       name += ` - Chư hầu của ${liegeName}`;
    }
    return name;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-6xl max-h-[95vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-950">
          <h2 className="text-xl font-display text-neutral-200 flex items-center gap-2">
            <span>🗺️</span> Bản Đồ Thế Giới
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors text-xl">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* Map Grid Area */}
          <div className="flex-1 p-4 md:p-8 flex items-center justify-center bg-[#0a0a0a] overflow-auto cursor-grab active:cursor-grabbing">
            {!mapData ? (
              <div className="text-neutral-500 italic">Đang vẽ bản đồ...</div>
            ) : (
              <div 
                className="grid bg-black shadow-2xl ring-1 ring-neutral-800"
                style={{ 
                  // No gap for cleaner borders
                  gap: '0px',
                  gridTemplateColumns: `repeat(${mapData.cols}, minmax(16px, 1fr))`,
                  width: 'fit-content',
                  minWidth: 'min-content' 
                }}
              >
                {mapData.grid.map((row, rIndex) => (
                  row.map((cellId, cIndex) => {
                    const visual = getCellVisuals(cellId);
                    return (
                      <div 
                        key={`${rIndex}-${cIndex}`}
                        className="w-5 h-5 md:w-6 md:h-6 relative group transition-colors duration-300"
                        style={{ 
                          background: visual.background,
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 whitespace-nowrap bg-black/95 text-white text-xs px-2 py-1 rounded border border-neutral-600 shadow-lg pointer-events-none">
                          {getCellName(cellId)}
                        </div>
                      </div>
                    );
                  })
                ))}
              </div>
            )}
          </div>

          {/* Legend / Sidebar */}
          <div className="w-full md:w-80 bg-neutral-900 border-l border-neutral-800 p-4 overflow-y-auto custom-scrollbar shadow-xl z-10">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">Địa Hình</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <div className="w-4 h-4 bg-[#172554]"></div> Biển cả
                </div>
            </div>

            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">Các Quốc Gia</h3>
            
            <div className="space-y-3">
              {/* Player Legend */}
              <div className="flex items-center gap-3 p-2 rounded bg-amber-900/20 border border-amber-700/50">
                <div className="w-6 h-6 rounded bg-amber-600 shadow-sm shrink-0"></div>
                <div>
                  <div className="font-bold text-amber-500 text-sm">{settings.kingdomName}</div>
                  <div className="text-[10px] text-neutral-400">Vương quốc của bạn</div>
                </div>
              </div>

              {/* Other Entities */}
              {worldInfo.entities.map(entity => {
                let bgStyle = { background: entity.color };
                let subText = `${entity.type} • ${entity.relation}`;
                
                if (entity.liegeId) {
                   const liege = worldInfo.entities.find(e => e.id === entity.liegeId);
                   const liegeColor = entity.liegeId === 'P' ? '#d97706' : (liege ? liege.color : '#333');
                   const liegeName = entity.liegeId === 'P' ? settings.kingdomName : (liege?.name || 'Unknown');
                   
                   bgStyle = {
                     background: `repeating-linear-gradient(45deg, ${entity.color}, ${entity.color} 4px, ${liegeColor} 4px, ${liegeColor} 8px)`
                   };
                   subText = `Chư hầu của ${liegeName}`;
                }

                return (
                  <div key={entity.id} className="flex items-center gap-3 p-2 rounded hover:bg-neutral-800 transition-colors">
                    <div 
                      className="w-6 h-6 rounded shadow-sm shrink-0 border border-neutral-700/50"
                      style={bgStyle}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-neutral-200 text-sm truncate">{entity.name}</div>
                      <div className="text-[10px] text-neutral-500 truncate">{subText}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};