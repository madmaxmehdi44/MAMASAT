import React, { useState } from 'react';
import { X, Satellite, Search, Radio, Check, Copy } from 'lucide-react';
import type { Channel } from '../types';

interface SatelliteGuideModalProps {
  channels: Channel[];
  onClose: () => void;
  onSelectChannel: (channel: Channel) => void;
}

export const SatelliteGuideModal: React.FC<SatelliteGuideModalProps> = ({
  channels,
  onClose,
  onSelectChannel,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSat, setSelectedSat] = useState<string>('all');

  const satellites = [
    { id: 'all', label: 'همه ماهواره‌ها' },
    { id: 'yahsat', label: 'یاه‌ست (Yahsat 52.5°E)' },
    { id: 'hotbird', label: 'هاتبرد (Hotbird 13°E)' },
    { id: 'eutelsat', label: 'یوتل‌ست (Eutelsat 7B)' },
  ];

  const filteredChannels = channels
    .filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(search.toLowerCase())) ||
        (c.frequency && c.frequency.includes(search));
      
      if (selectedSat === 'yahsat') return matchesSearch && (c.satellite?.includes('یاه‌ست') || c.satellite?.includes('Yahsat'));
      if (selectedSat === 'hotbird') return matchesSearch && (c.satellite?.includes('هاتبرد') || c.satellite?.includes('Hotbird'));
      return matchesSearch;
    })
    .slice(0, 40);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl max-h-[85vh] bg-[#212121] border border-[#383838] rounded-2xl shadow-2xl flex flex-col text-right text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#303030]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-500">
              <Satellite size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base">راهنمای فرکانس‌های ماهواره‌ای</h3>
              <p className="text-xs text-[#aaaaaa]">مشخصات فرکانس، سیمبل‌ریت و جهت‌های پخش ماهواره‌ای</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#333333] text-[#aaaaaa] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] flex items-center bg-[#121212] border border-[#333333] rounded-lg px-3 py-1.5">
            <Search size={16} className="text-[#888888] ml-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی نام شبکه یا فرکانس..."
              className="w-full bg-transparent text-xs text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {satellites.map((sat) => (
              <button
                key={sat.id}
                type="button"
                onClick={() => setSelectedSat(sat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedSat === sat.id
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-[#272727] text-[#cccccc] hover:bg-[#333333]'
                }`}
              >
                {sat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Channels frequency list table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredChannels.map((c) => (
              <div 
                key={c.id}
                onClick={() => {
                  onSelectChannel(c);
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#181818] border border-[#2d2d2d] hover:border-red-500/50 hover:bg-[#202020] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                    {c.name}
                    {c.nameEn && <span className="text-xs text-[#888888] mr-1">({c.nameEn})</span>}
                  </div>
                  <span className="text-[10px] bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                    {c.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#bbbbbb] bg-[#121212] p-2 rounded-lg">
                  <div>
                    <span className="text-[#777777] block text-[10px]">ماهواره:</span>
                    <span className="font-semibold text-white truncate block">{c.satellite || 'یاه‌ست / هاتبرد'}</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block text-[10px]">فرکانس:</span>
                    <span className="font-bold text-emerald-400">{c.frequency || '11900 MHz'}</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block text-[10px]">پلاریزاسیون:</span>
                    <span className="font-medium text-white">{c.polarization || 'افقی (H)'}</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block text-[10px]">Symbol Rate:</span>
                    <span className="font-medium text-white">{c.symbolRate || '27500'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
