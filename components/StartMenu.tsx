import React from 'react';

interface StartMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onNewGame, onLoadGame }) => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-100 p-4 relative overflow-hidden w-full">
      {/* Background ambience */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-amber-900/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl"></div>

      <div className="z-10 text-center space-y-8 animate-fade-in max-w-md w-full">
        <div className="mb-8">
          <span className="text-6xl mb-4 block">🏰</span>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-amber-500 mb-2 drop-shadow-md">
            Vương Quốc Ký Sự
          </h1>
          <p className="text-neutral-500 font-serif italic">
            "Vận mệnh vương quốc nằm trong tay ngài..."
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={onNewGame}
            className="w-full bg-amber-700 hover:bg-amber-600 text-white font-display text-xl py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-xl border border-amber-500/30 group"
          >
            <span className="group-hover:mr-2 transition-all">✦</span> Khởi Tạo Vương Quốc Mới
          </button>

          <button
            onClick={onLoadGame}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-display text-xl py-4 px-8 rounded-lg transition-all duration-300 border border-neutral-700 flex items-center justify-center hover:scale-[1.02] shadow-lg"
          >
             📂 Tải Game Đã Lưu
          </button>
        </div>
        
        <div className="text-neutral-600 text-xs mt-12">
          v1.3 • Powered by Google Gemini
        </div>
      </div>
    </div>
  );
};