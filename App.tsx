
import React, { useState, useRef } from 'react';
import { KingdomStats, GameLog, ActionType, GameSettings, WorldInfo, KingdomHeritage, KingdomBuff, SuggestedAction } from './types';
import { processGameTurn } from './services/geminiService';
import { ResourceCard } from './components/ResourceCard';
import { GameLog as GameLogComponent } from './components/GameLog';
import { ActionPanel } from './components/ActionPanel';
import { StartMenu } from './components/StartMenu';
import { WorldCreation } from './components/WorldCreation';
import { InfoModal } from './components/InfoModal';
import { PoliticsModal } from './components/PoliticsModal';
import { MapModal } from './components/MapModal';
import { EconomyModal } from './components/EconomyModal'; // Imported new modal

const GoldIcon = <span role="img" aria-label="gold">🪙</span>;
const FoodIcon = <span role="img" aria-label="food">🍞</span>;
const PopIcon = <span role="img" aria-label="population">👥</span>;
const ArmyIcon = <span role="img" aria-label="army">⚔️</span>;
const HappyIcon = <span role="img" aria-label="happiness">🎭</span>;
const TimeIcon = <span role="img" aria-label="time">⏳</span>;
// New Icons
const WoodIcon = <span role="img" aria-label="wood">🪵</span>;
const StoneIcon = <span role="img" aria-label="stone">🪨</span>;
const ManpowerIcon = <span role="img" aria-label="manpower">💪</span>;
const SuppliesIcon = <span role="img" aria-label="supplies">📦</span>;
const EPIcon = <span role="img" aria-label="ep">📈</span>;

const ZERO_STATS: KingdomStats = {
  year: 1,
  month: 1,
  gold: 0,
  food: 0,
  population: 0,
  army: 0,
  happiness: 50,
  wood: 0,
  stone: 0,
  manpower: 0,
  supplies: 0,
  economicPower: 0,
  taxRate: 'Standard'
};

const DEFAULT_SETTINGS: GameSettings = {
  worldTheme: 'Trung cổ',
  kingdomName: 'Vương Quốc',
  background: 'Vùng đất mới',
  leaderName: 'Đức Vua',
  leaderDescription: ''
};

const INITIAL_WORLD_INFO: WorldInfo = {
  entities: [],
  people: [],
  rumors: []
};

const INITIAL_HERITAGE: KingdomHeritage = {
  royalFamily: [],
  divisions: []
};

// Initial choices before the game processes the first prompt
const INITIAL_CHOICES: SuggestedAction[] = [
  { label: "Bắt đầu triều đại", action: "Bước lên ngai vàng và tuyên bố triều đại bắt đầu", style: "Neutral" }
];

const App: React.FC = () => {
  const [view, setView] = useState<'menu' | 'creation' | 'game'>('menu');
  const [stats, setStats] = useState<KingdomStats>(ZERO_STATS);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [worldInfo, setWorldInfo] = useState<WorldInfo>(INITIAL_WORLD_INFO);
  const [heritage, setHeritage] = useState<KingdomHeritage>(INITIAL_HERITAGE);
  const [activeBuffs, setActiveBuffs] = useState<KingdomBuff[]>([]); 
  const [currentChoices, setCurrentChoices] = useState<SuggestedAction[]>(INITIAL_CHOICES);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastChange, setLastChange] = useState<Partial<KingdomStats>>({});
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPoliticsModal, setShowPoliticsModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showEconomyModal, setShowEconomyModal] = useState(false); // New State
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to calculate estimated upkeep/income based on game rules
  // Updated logic to include EP and Tax Rate
  const getEstimatedForecast = (currentStats: KingdomStats) => {
    // UPDATED Rules:
    // Income: Pop * TaxMod * (EP/100)
    // Army Upkeep: Food (Army * 2.0), Gold (Army * 1.0)
    
    let taxMod = 1.0;
    switch(currentStats.taxRate) {
        case 'Tax Haven': taxMod = 0; break;
        case 'Low': taxMod = 0.5; break;
        case 'Standard': taxMod = 1.0; break;
        case 'Extortion': taxMod = 1.5; break;
        default: taxMod = 1.0;
    }
    
    // Base gold per person (tiny value) multiplied by tax mod and EP factor
    // Let's assume base tax per person is roughly 0.1 gold per month at standard tax
    // EP acts as a percentage multiplier (EP 100 = 100% efficiency)
    const epFactor = Math.max(0.1, (currentStats.economicPower || 10) / 100);
    const estimatedIncome = Math.floor(currentStats.population * 0.1 * taxMod * epFactor * 10); // Multiplied by 10 to make numbers visible

    const foodUpkeep = Math.floor(currentStats.army * 2.0);
    const goldUpkeep = Math.floor(currentStats.army * 1.0);
    
    const netGold = estimatedIncome - goldUpkeep;

    return {
      food: -foodUpkeep,
      gold: netGold
    };
  };

  const forecast = getEstimatedForecast(stats);

  const handleCreateWorld = () => {
    setView('creation');
  };

  const startNewGame = async (newSettings: GameSettings) => {
    setSettings(newSettings);
    setStats(ZERO_STATS); 
    setWorldInfo(INITIAL_WORLD_INFO);
    setHeritage(INITIAL_HERITAGE);
    setActiveBuffs([]);
    setCurrentChoices([]); 
    setGameOver(false);
    setLastChange({});
    setLogs([]); 
    setView('game');
    setIsProcessing(true);

    try {
        const result = await processGameTurn(
            ZERO_STATS, 
            "KHỞI TẠO", 
            newSettings, 
            INITIAL_WORLD_INFO, 
            INITIAL_HERITAGE,
            [],
            [] // Empty history for new game
        );
        
        if (result.initialStats) {
            setStats(result.initialStats);
        } else {
            setStats({ 
                ...ZERO_STATS, 
                gold: 100, 
                food: 500, 
                population: 100, 
                army: 10,
                happiness: 50,
                economicPower: 10,
                taxRate: 'Standard'
            });
        }

        if (result.worldUpdate) handleWorldUpdate(result.worldUpdate);
        if (result.politicalUpdate) handlePoliticalUpdate(result.politicalUpdate);
        if (result.buffsUpdate) handleBuffsUpdate(result.buffsUpdate);
        if (result.suggestedActions) setCurrentChoices(result.suggestedActions);
        
        setLogs([
            {
                id: 'init',
                type: 'ai',
                content: result.narrative,
                timestamp: `Năm 1 - Tháng 1`,
                eventTitle: "Khởi Nguyên"
            }
        ]);
    } catch (e) {
         setLogs([
            {
                id: 'init',
                type: 'system',
                content: `Hệ thống gặp sự cố khi kiến tạo thế giới. Bạn bắt đầu với hai bàn tay trắng.`,
                timestamp: `Năm 1`
            }
        ]);
        setStats({ 
            ...ZERO_STATS, 
            gold: 50, 
            food: 100, 
            population: 50, 
            army: 0,
            happiness: 50
        });
        setCurrentChoices([
           { label: "Tìm kiếm thức ăn", action: "Cho người đi hái lượm và săn bắn", style: "Economic" },
           { label: "Xây dựng lều trại", action: "Dựng nơi trú ẩn tạm thời", style: "Neutral" },
        ]);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleWorldUpdate = (update: NonNullable<import('./types').TurnResult['worldUpdate']>) => {
      setWorldInfo(prev => {
          const newInfo = { ...prev };
          
          if (update.newEntities) {
              update.newEntities.forEach(ne => {
                  const idx = newInfo.entities.findIndex(e => e.id === ne.id);
                  if (idx !== -1) {
                      newInfo.entities[idx] = ne;
                  } else {
                      newInfo.entities.push(ne);
                  }
              });
          }
          if (update.newPeople) newInfo.people = [...prev.people, ...update.newPeople];
          
          let updatedRumors = [...prev.rumors];
          
          if (update.resolvedRumorIds && update.resolvedRumorIds.length > 0) {
            updatedRumors = updatedRumors.map(r => 
              update.resolvedRumorIds?.includes(r.id) ? { ...r, isResolved: true } : r
            );
          }
          
          if (update.newRumors) {
             update.newRumors.forEach(nr => {
                if (!updatedRumors.some(r => r.id === nr.id)) {
                   updatedRumors.push(nr);
                }
             });
          }
          
          newInfo.rumors = updatedRumors;
          return newInfo;
      });
  };

  const handlePoliticalUpdate = (update: NonNullable<import('./types').TurnResult['politicalUpdate']>) => {
      setHeritage(prev => {
          let newFamily = [...prev.royalFamily];
          let newDivisions = [...prev.divisions];

          if (update.newFamilyMembers) newFamily = [...newFamily, ...update.newFamilyMembers];
          if (update.updatedFamilyMembers) {
              update.updatedFamilyMembers.forEach(updated => {
                  const idx = newFamily.findIndex(p => p.id === updated.id);
                  if (idx !== -1) newFamily[idx] = updated;
              });
          }

          if (update.newDivisions) newDivisions = [...newDivisions, ...update.newDivisions];
          if (update.updatedDivisions) {
              update.updatedDivisions.forEach(updated => {
                  const idx = newDivisions.findIndex(d => d.id === updated.id);
                  if (idx !== -1) newDivisions[idx] = updated;
              });
          }

          return { royalFamily: newFamily, divisions: newDivisions };
      });
  };

  const handleBuffsUpdate = (update: NonNullable<import('./types').TurnResult['buffsUpdate']>) => {
    setActiveBuffs(prev => {
      let nextBuffs = [...prev];
      if (update.removedBuffIds) {
        nextBuffs = nextBuffs.filter(b => !update.removedBuffIds?.includes(b.id));
      }
      if (update.newBuffs) {
        update.newBuffs.forEach(newBuff => {
          if (!nextBuffs.some(b => b.id === newBuff.id)) {
            nextBuffs.push(newBuff);
          }
        });
      }
      return nextBuffs;
    });
  };

  const triggerLoadGame = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.stats || !parsed.logs || !parsed.settings) {
          throw new Error("File không hợp lệ");
        }

        setStats(parsed.stats);
        setLogs(parsed.logs);
        setGameOver(parsed.gameOver || false);
        setLastChange(parsed.lastChange || {});
        setSettings(parsed.settings);
        setWorldInfo(parsed.worldInfo || INITIAL_WORLD_INFO);
        setHeritage(parsed.heritage || INITIAL_HERITAGE);
        setActiveBuffs(parsed.activeBuffs || []);
        setCurrentChoices(parsed.currentChoices || []);
        
        setView('game');
      } catch (err) {
        console.error(err);
        alert("File không hợp lệ!");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const saveGame = () => {
    const data = { stats, logs, gameOver, lastChange, settings, worldInfo, heritage, activeBuffs, currentChoices };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const safeKingdomName = settings.kingdomName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `kingdom_${safeKingdomName}_Y${stats.year}_M${stats.month}.json`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exitToMenu = () => {
    setView('menu');
  };

  const handleAction = async (actionType: ActionType, customInput?: string) => {
    if (isProcessing || gameOver) return;

    const actionText = actionType === ActionType.CUSTOM ? customInput! : actionType;
    const currentTimeString = `Năm ${stats.year} - Tháng ${stats.month}`;
    
    // Create temp logs to send to AI including the user's current action
    const currentLog: GameLog = {
      id: Date.now().toString(),
      type: 'user',
      content: actionText,
      timestamp: currentTimeString
    };

    const updatedLogsForHistory = [...logs, currentLog];
    setLogs(updatedLogsForHistory);
    
    setIsProcessing(true);
    setCurrentChoices([]);

    const result = await processGameTurn(
      stats, 
      actionText, 
      settings, 
      worldInfo, 
      heritage, 
      activeBuffs, 
      updatedLogsForHistory // Pass full history + current action
    );

    if (result.worldUpdate) handleWorldUpdate(result.worldUpdate);
    if (result.politicalUpdate) handlePoliticalUpdate(result.politicalUpdate);
    if (result.buffsUpdate) handleBuffsUpdate(result.buffsUpdate);
    if (result.suggestedActions) setCurrentChoices(result.suggestedActions);

    if (result.isGameOver) {
      setGameOver(true);
      setLogs(prev => [
        ...prev,
        {
          id: Date.now().toString() + '_ai',
          type: 'ai',
          content: result.narrative,
          timestamp: currentTimeString,
          eventTitle: result.eventTitle
        },
        {
          id: Date.now().toString() + '_over',
          type: 'system',
          content: `Vương quốc sụp đổ! Nguyên nhân: ${result.gameOverReason || 'Không rõ'}.`,
          timestamp: currentTimeString
        }
      ]);
    } else {
      // HANDLE DYNAMIC TIME PASSING (MONTHLY)
      const monthsPassed = result.monthsPassed || 1;
      let nextMonth = stats.month + monthsPassed;
      let nextYear = stats.year;
      
      while (nextMonth > 12) {
        nextMonth -= 12;
        nextYear += 1;
      }

      // Safe update for new resource fields
      const newStats = {
        year: nextYear,
        month: nextMonth,
        gold: Math.max(0, stats.gold + result.statsChange.gold),
        food: Math.max(0, stats.food + result.statsChange.food),
        population: Math.max(0, stats.population + result.statsChange.population),
        army: Math.max(0, stats.army + result.statsChange.army),
        happiness: Math.min(100, Math.max(0, stats.happiness + result.statsChange.happiness)),
        wood: Math.max(0, (stats.wood || 0) + (result.statsChange.wood || 0)),
        stone: Math.max(0, (stats.stone || 0) + (result.statsChange.stone || 0)),
        manpower: Math.max(0, (stats.manpower || 0) + (result.statsChange.manpower || 0)),
        supplies: Math.max(0, (stats.supplies || 0) + (result.statsChange.supplies || 0)),
        economicPower: Math.max(0, (stats.economicPower || 0) + (result.statsChange.economicPower || 0)),
        taxRate: stats.taxRate // Maintain current tax rate, unless AI explicitly suggests changing it (not implemented yet in AI response, user controls this)
      };

      setLastChange({
        gold: result.statsChange.gold,
        food: result.statsChange.food,
        population: result.statsChange.population,
        army: result.statsChange.army,
        happiness: result.statsChange.happiness,
        wood: result.statsChange.wood,
        stone: result.statsChange.stone,
        manpower: result.statsChange.manpower,
        supplies: result.statsChange.supplies,
        economicPower: result.statsChange.economicPower
      });

      setStats(newStats);

      const newLogs: GameLog[] = [
        {
          id: Date.now().toString() + '_ai',
          type: 'ai',
          content: result.narrative,
          timestamp: `Năm ${nextYear} - Tháng ${nextMonth}`, 
          eventTitle: result.eventTitle
        }
      ];

      if (result.otherKingdomsActions && result.otherKingdomsActions.length > 0) {
        newLogs.push({
          id: Date.now().toString() + '_world',
          type: 'world_event',
          content: 'Sự kiện thế giới', 
          timestamp: `Năm ${nextYear} - Tháng ${nextMonth}`,
          entityActions: result.otherKingdomsActions
        });
      }

      setLogs(prev => [...prev, ...newLogs]);
    }

    setIsProcessing(false);
  };

  // Callback to update Tax Rate instantly
  const handleTaxChange = (rate: KingdomStats['taxRate']) => {
    setStats(prev => ({ ...prev, taxRate: rate }));
  };

  return (
    <div className="h-screen bg-neutral-900 text-neutral-100 font-sans overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        style={{ display: 'none' }}
      />
      
      <InfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
        settings={settings}
        stats={stats}
        worldInfo={worldInfo}
      />

      <PoliticsModal
        isOpen={showPoliticsModal}
        onClose={() => setShowPoliticsModal(false)}
        settings={settings}
        heritage={heritage}
      />

      <EconomyModal
        isOpen={showEconomyModal}
        onClose={() => setShowEconomyModal(false)}
        stats={stats}
        onAction={handleAction}
        onTaxChange={handleTaxChange}
      />

      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        mapData={null}
        worldInfo={worldInfo}
        settings={settings}
      />

      {view === 'menu' && (
        <StartMenu onNewGame={handleCreateWorld} onLoadGame={triggerLoadGame} />
      )}

      {view === 'creation' && (
        <WorldCreation onStart={startNewGame} onBack={() => setView('menu')} />
      )}

      {view === 'game' && (
        <div className="flex h-full flex-col md:flex-row">
          
          {/* LEFT SIDEBAR - DASHBOARD */}
          <aside className="w-full md:w-80 bg-neutral-950 border-r border-neutral-800 flex flex-col z-20 shadow-2xl shrink-0">
             <div className="p-6 border-b border-neutral-800 bg-neutral-950">
               <div className="flex items-center gap-3 mb-2">
                 <span className="text-4xl">🏰</span>
                 <div>
                   <h1 className="text-xl font-bold font-display text-amber-500 leading-tight">
                     {settings.kingdomName}
                   </h1>
                   <span className="text-xs text-neutral-400 uppercase tracking-wider block mt-1">
                     {settings.leaderName}
                   </span>
                 </div>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
               <div className="mb-4">
                  <ResourceCard 
                    label="Niên Lịch" 
                    value={`Năm ${stats.year} - Tháng ${stats.month}`} 
                    icon={TimeIcon} 
                    colorClass="text-neutral-400" 
                  />
               </div>
               
               {/* PRIMARY RESOURCES */}
               <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 px-1">Kho Bạc & Lương Thực</h3>
               <ResourceCard 
                    label="Vàng" 
                    value={stats.gold} 
                    icon={GoldIcon} 
                    colorClass="text-amber-400" 
                    change={lastChange.gold}
                    forecast={forecast.gold} // Updated logic
               />
               <ResourceCard 
                    label="Sức Mạnh Kinh Tế (EP)" 
                    value={stats.economicPower || 0} 
                    icon={EPIcon} 
                    colorClass="text-emerald-400" 
                    change={lastChange.economicPower}
               />
               <ResourceCard 
                    label="Lương Thực" 
                    value={stats.food} 
                    icon={FoodIcon} 
                    colorClass="text-green-500" 
                    change={lastChange.food} 
                    forecast={forecast.food} 
               />

               {/* CONSTRUCTION RESOURCES */}
               <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-6 mb-2 px-1">Tài Nguyên Xây Dựng</h3>
               <div className="grid grid-cols-2 gap-2">
                 <ResourceCard label="Gỗ" value={stats.wood || 0} icon={WoodIcon} colorClass="text-amber-700" change={lastChange.wood} />
                 <ResourceCard label="Đá" value={stats.stone || 0} icon={StoneIcon} colorClass="text-zinc-400" change={lastChange.stone} />
               </div>

               {/* POPULATION & ARMY */}
               <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-6 mb-2 px-1">Nhân Sự & Quốc Phòng</h3>
               <ResourceCard label="Dân Số" value={stats.population} icon={PopIcon} colorClass="text-blue-400" change={lastChange.population} />
               <ResourceCard label="Nhân Lực" value={stats.manpower || 0} icon={ManpowerIcon} colorClass="text-orange-400" change={lastChange.manpower} />
               
               <div className="grid grid-cols-2 gap-2">
                 <ResourceCard label="Quân Đội" value={stats.army} icon={ArmyIcon} colorClass="text-red-500" change={lastChange.army} />
                 <ResourceCard label="Vật Tư" value={stats.supplies || 0} icon={SuppliesIcon} colorClass="text-amber-800" change={lastChange.supplies} />
               </div>
               <ResourceCard label="Hạnh Phúc" value={stats.happiness} icon={HappyIcon} colorClass="text-pink-400" change={lastChange.happiness} />

               {activeBuffs.length > 0 && (
                 <div className="mt-8 animate-fade-in">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 px-1 border-t border-neutral-800 pt-4 flex justify-between items-center">
                        <span>Trạng Thái & Hiệu Ứng</span>
                        <span className="bg-neutral-800 text-[10px] px-2 py-0.5 rounded-full">{activeBuffs.length}</span>
                    </h3>
                    <div className="space-y-2">
                      {activeBuffs.map(buff => (
                        <div 
                          key={buff.id} 
                          className={`
                            p-3 rounded border text-sm relative group transition-all hover:scale-[1.02]
                            ${buff.type === 'Positive' ? 'bg-green-900/10 border-green-800/30 text-green-200' : 
                              buff.type === 'Negative' ? 'bg-red-900/10 border-red-800/30 text-red-200' :
                              'bg-neutral-800/50 border-neutral-700 text-neutral-300'}
                          `}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold flex items-center gap-2">
                                {buff.type === 'Positive' ? '▲' : buff.type === 'Negative' ? '▼' : '•'} {buff.name}
                            </span>
                          </div>
                          <p className="text-xs mt-1 text-amber-500/80 font-mono">{buff.effect}</p>
                          <p className="text-[10px] mt-1 opacity-60 leading-tight">{buff.description}</p>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
             </div>
          </aside>

          {/* RIGHT MAIN AREA */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#121212] relative">
             <header className="h-14 border-b border-neutral-800 flex justify-between items-center px-4 bg-neutral-900/95 backdrop-blur z-10">
                <div className="md:hidden font-display text-amber-500 font-bold truncate pr-4">
                  {settings.kingdomName}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                   <button onClick={() => setShowEconomyModal(true)} disabled={isProcessing} className="text-xs md:text-sm bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-200 px-3 py-1.5 rounded transition-colors flex items-center gap-2">
                      <span>💰</span> <span className="hidden md:inline">Kinh Tế</span>
                   </button>
                   <button onClick={() => setShowPoliticsModal(true)} disabled={isProcessing} className="text-xs md:text-sm bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-200 px-3 py-1.5 rounded transition-colors flex items-center gap-2">
                      <span>🏛️</span> <span className="hidden md:inline">Chính Trị</span>
                   </button>
                   <button onClick={() => setShowInfoModal(true)} disabled={isProcessing} className="text-xs md:text-sm bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-200 px-3 py-1.5 rounded transition-colors flex items-center gap-2">
                      <span>📜</span> <span className="hidden md:inline">Thông Tin</span>
                   </button>
                   <div className="w-px h-6 bg-neutral-700 mx-1"></div>
                   <button onClick={saveGame} disabled={gameOver || isProcessing} className="text-xs md:text-sm bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-300 px-3 py-1.5 rounded transition-colors disabled:opacity-50" title="Lưu Game">💾</button>
                   <button onClick={exitToMenu} className="text-xs md:text-sm bg-neutral-800 hover:bg-red-900/50 border border-neutral-600 hover:border-red-800 text-neutral-300 hover:text-red-200 px-3 py-1.5 rounded transition-colors" title="Thoát">🚪</button>
                </div>
             </header>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 scroll-smooth">
                <GameLogComponent logs={logs} isThinking={isProcessing} />
                {gameOver && (
                  <div className="bg-red-900/20 border border-red-800/50 p-8 rounded-xl text-center animate-fade-in mt-8 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-display text-red-500 mb-2">Vương Triều Sụp Đổ</h2>
                    <p className="mb-6 text-neutral-300">Triều đại của bạn kéo dài {stats.year} năm, {stats.month} tháng.</p>
                    <div className="flex gap-4 justify-center">
                       <button onClick={exitToMenu} className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">Về Menu</button>
                       <button onClick={handleCreateWorld} className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg">Khởi Tạo Lại</button>
                    </div>
                  </div>
                )}
             </div>

             {!gameOver && (
               <div className="p-4 bg-neutral-900 border-t border-neutral-800 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
                  <div className="max-w-4xl mx-auto">
                    <ActionPanel onAction={handleAction} disabled={isProcessing} choices={currentChoices}/>
                  </div>
               </div>
             )}
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
