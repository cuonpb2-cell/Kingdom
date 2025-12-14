import React, { useState } from 'react';
import { GameSettings } from '../types';

interface WorldCreationProps {
  onStart: (settings: GameSettings) => void;
  onBack: () => void;
}

export const WorldCreation: React.FC<WorldCreationProps> = ({ onStart, onBack }) => {
  const [settings, setSettings] = useState<GameSettings>({
    worldTheme: '',
    kingdomName: '',
    background: '',
    leaderName: '',
    leaderDescription: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(settings).every((val) => (val as string).trim().length > 0)) {
      onStart(settings);
    }
  };

  const handleChange = (field: keyof GameSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 text-neutral-200">
      <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-xl p-6 md:p-8 shadow-2xl animate-fade-in relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <span className="text-9xl">🗺️</span>
        </div>

        <h2 className="text-3xl font-display text-amber-500 mb-6 border-b border-neutral-800 pb-4">
          Kiến Tạo Thế Giới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-amber-600 uppercase tracking-wider">
                Thế giới của bạn
              </label>
              <input
                type="text"
                required
                placeholder="VD: Trung cổ phép thuật, Hậu tận thế..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:border-amber-500 focus:outline-none transition-colors"
                value={settings.worldTheme}
                onChange={(e) => handleChange('worldTheme', e.target.value)}
              />
              <p className="text-xs text-neutral-500">Môi trường nơi vương quốc tồn tại.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-amber-600 uppercase tracking-wider">
                Danh xưng Lãnh đạo
              </label>
              <input
                type="text"
                required
                placeholder="VD: Vua Arthur, Nữ hoàng Elsa..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:border-amber-500 focus:outline-none transition-colors"
                value={settings.leaderName}
                onChange={(e) => handleChange('leaderName', e.target.value)}
              />
              <p className="text-xs text-neutral-500">Tên và tước hiệu của bạn.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-amber-600 uppercase tracking-wider">
              Mô tả Lãnh đạo
            </label>
            <input
              type="text"
              required
              placeholder="VD: Một công tước trẻ 18 tuổi, tham vọng và tài năng..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:border-amber-500 focus:outline-none transition-colors"
              value={settings.leaderDescription}
              onChange={(e) => handleChange('leaderDescription', e.target.value)}
            />
            <p className="text-xs text-neutral-500">Tuổi tác, tính cách, tiểu sử ngắn của nhân vật.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-amber-600 uppercase tracking-wider">
              Tên Vương Quốc
            </label>
            <input
              type="text"
              required
              placeholder="VD: Đại Việt, Gondor, Atlantis..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:border-amber-500 focus:outline-none transition-colors font-display text-lg"
              value={settings.kingdomName}
              onChange={(e) => handleChange('kingdomName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-amber-600 uppercase tracking-wider">
              Bối cảnh khởi đầu
            </label>
            <textarea
              required
              rows={3}
              placeholder="VD: Một vùng đất hoang sơ mới được khai phá, hay một tàn tích cổ xưa cần phục hưng..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:border-amber-500 focus:outline-none transition-colors"
              value={settings.background}
              onChange={(e) => handleChange('background', e.target.value)}
            />
            <p className="text-xs text-neutral-500">Mô tả ngắn gọn về tình hình hiện tại.</p>
          </div>

          <div className="flex gap-4 pt-4 mt-6 border-t border-neutral-800">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-lg border border-neutral-600 hover:bg-neutral-800 text-neutral-400 transition-colors"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-amber-900/20 transition-all transform hover:scale-[1.01]"
            >
              Khai Sinh Vương Quốc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};