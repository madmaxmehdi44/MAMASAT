import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageCircle, Twitter } from 'lucide-react';
import type { Channel } from '../types';

interface ShareModalProps {
  channel: Channel;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ channel, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://momsat.tv';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareServices = [
    {
      name: 'تلگرام',
      icon: Send,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`تماشای زنده شبکه ${channel.name} در MOMSAT YouTube TV`)}`,
      color: 'bg-[#229ED9]',
    },
    {
      name: 'واتس‌اپ',
      icon: MessageCircle,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`تماشای زنده ${channel.name}: ${shareUrl}`)}`,
      color: 'bg-[#25D366]',
    },
    {
      name: 'ایکس / توییتر',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`پخش زنده شبکه ${channel.name}`)}`,
      color: 'bg-[#1DA1F2]',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#212121] border border-[#383838] rounded-2xl shadow-2xl p-5 text-right text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#303030]">
          <h3 className="font-bold text-base">اشتراک‌گذاری شبکه</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#333333] text-[#aaaaaa] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4">
          <div className="text-xs text-[#aaaaaa] mb-2 font-medium">ارسال مستقیم در شبکه‌های اجتماعی:</div>
          <div className="flex items-center justify-around gap-2 mb-4">
            {shareServices.map((svc) => {
              const Icon = svc.icon;
              return (
                <a
                  key={svc.name}
                  href={svc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#2c2c2c] transition-colors group"
                >
                  <div className={`w-11 h-11 rounded-full ${svc.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-semibold text-[#e1e1e1]">{svc.name}</span>
                </a>
              );
            })}
          </div>

          <div className="text-xs text-[#aaaaaa] mb-1.5 font-medium">کپی لینک صفحه:</div>
          <div className="flex items-center bg-[#121212] border border-[#383838] rounded-xl p-1.5">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs text-[#dddddd] px-2 outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'کپی شد' : 'کپی'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
