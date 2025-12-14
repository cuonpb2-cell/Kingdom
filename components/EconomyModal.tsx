
import React from 'react';
import { KingdomStats, ActionType } from '../types';

interface EconomyModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: KingdomStats;
  onAction: (actionType: ActionType, customInput?: string) => void;
  onTaxChange: (rate: KingdomStats['taxRate']) => void;
}

export const EconomyModal: React.FC<EconomyModalProps> = ({ isOpen, onClose, stats, onAction, onTaxChange }) => {
  if (!isOpen) return null;

  const taxRates: KingdomStats['taxRate'][] = ['Tax Haven', 'Low', 'Standard', 'Extortion'];

  const getTaxDescription = (rate: string) => {
    switch (rate) {
      case 'Tax Haven': return "Miễn thuế: Không thu Vàng. Dân số tăng nhanh. Hạnh phúc tăng mạnh.";
      case 'Low': return "Thuế thấp: Thu nhập trung bình. Tăng nhẹ Kinh tế (EP) và Hạnh phúc.";
      case 'Standard': return "Tiêu chuẩn: Thu nhập ổn định. Hạnh phúc giảm nhẹ theo thời gian.";
      case 'Extortion': return "Bóc lột: Thu nhập cực cao. Dân bỏ đi. Nguy cơ bạo loạn cao.";
      default: return "";
    }
  };

  const handleInvest = (type: string) => {
    let actionDescription = "";
    switch(type) {
        case 'Infrastructure':
            actionDescription = "Đầu tư Ngân sách vào Hạ tầng (Xây đường, chợ) để tăng Sức mạnh Kinh tế (EP).";
            break;
        case 'Welfare':
            actionDescription = "Chi Ngân sách cho Phúc lợi xã hội (Cứu trợ, Lễ hội) để tăng Hạnh phúc.";
            break;
        case 'Defense':
            actionDescription = "Đầu tư Quốc phòng (Mua sắm vũ khí, gia cố thành) để tăng Sức mạnh Quân đội và Vật tư.";
            break;
    }
    onAction(ActionType.INVEST, actionDescription);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-amber-700/50 w-full max-w-2xl rounded-xl flex flex-col shadow-2xl relative">
        
        <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-950 rounded-t-xl">
          <h2 className="text-xl font-display text-amber-500 flex items-center gap-2">
            <span>💰</span> Bộ Tài Chính & Kinh Tế
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Economic Overview */}
          <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700 grid grid-cols-2 gap-4">
             <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block">Sức Mạnh Kinh Tế (EP)</span>
                <span className="text-2xl font-bold text-amber-400 font-display">{stats.economicPower}</span>
                <p className="text-[10px] text-neutral-400 mt-1">Ảnh hưởng trực tiếp đến hiệu quả thu thuế.</p>
             </div>
             <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block">Ngân Khố Hiện Tại</span>
                <span className="text-2xl font-bold text-yellow-500 font-display">{stats.gold.toLocaleString()} 🪙</span>
             </div>
          </div>

          {/* Tax Slider */}
          <div>
            <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">Chính Sách Thuế</h3>
            <div className="flex flex-col gap-4">
              <input 
                type="range" 
                min="0" 
                max="3" 
                step="1" 
                value={taxRates.indexOf(stats.taxRate || 'Standard')}
                onChange={(e) => onTaxChange(taxRates[parseInt(e.target.value)])}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-xs text-neutral-500 font-mono uppercase">
                <span>Miễn Thuế</span>
                <span>Thấp</span>
                <span>Tiêu Chuẩn</span>
                <span>Bóc Lột</span>
              </div>
              
              <div className="bg-neutral-800 p-3 rounded border border-neutral-700 text-center transition-all">
                <span className="text-amber-500 font-bold block mb-1">{stats.taxRate || 'Standard'}</span>
                <span className="text-sm text-neutral-300">{getTaxDescription(stats.taxRate || 'Standard')}</span>
              </div>
            </div>
          </div>

          {/* Budget Allocation (Investment) */}
          <div>
            <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">Đầu Tư Ngân Sách</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button 
                onClick={() => handleInvest('Infrastructure')}
                disabled={stats.gold < 500}
                className="p-3 rounded border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 hover:border-amber-500 transition-all text-left group"
              >
                <div className="text-2xl mb-2">🏗️</div>
                <div className="font-bold text-neutral-200 text-sm group-hover:text-amber-400">Hạ Tầng</div>
                <div className="text-[10px] text-neutral-500 mt-1">Tốn Vàng & Gỗ. Tăng EP.</div>
              </button>

              <button 
                onClick={() => handleInvest('Welfare')}
                disabled={stats.gold < 300}
                className="p-3 rounded border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 hover:border-green-500 transition-all text-left group"
              >
                <div className="text-2xl mb-2">💖</div>
                <div className="font-bold text-neutral-200 text-sm group-hover:text-green-400">Phúc Lợi</div>
                <div className="text-[10px] text-neutral-500 mt-1">Tốn Vàng. Tăng Hạnh Phúc.</div>
              </button>

              <button 
                onClick={() => handleInvest('Defense')}
                disabled={stats.gold < 500}
                className="p-3 rounded border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 hover:border-red-500 transition-all text-left group"
              >
                <div className="text-2xl mb-2">🛡️</div>
                <div className="font-bold text-neutral-200 text-sm group-hover:text-red-400">Quốc Phòng</div>
                <div className="text-[10px] text-neutral-500 mt-1">Tốn Vàng. Tăng Vật Tư & Sức Mạnh.</div>
              </button>
            </div>
            <p className="text-[10px] text-neutral-600 mt-2 italic text-center">*Mỗi khoản đầu tư sẽ tiêu tốn tài nguyên ngay lập tức và tạo ra hiệu quả lâu dài.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
