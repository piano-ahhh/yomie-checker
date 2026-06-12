import React, { useState } from 'react';
import { Search, Sparkles, ChevronRight, X } from 'lucide-react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  onClear: () => void;
  sampleQueries: string[];
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, isLoading, onClear, sampleQueries }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSuggestClick = (q: string) => {
    setQuery(q);
    onSearch(q);
  };

  const clearInput = () => {
    setQuery('');
    onClear();
  };

  const helloLetters = ["h", "e", "l", "l", "o"];

  return (
    <div className="w-full max-w-xl mx-auto" id="cute-search-card-container">
      
      {/* Thick orange frame container + inner dotted edge (from index.css classes) */}
      <div className="cute-card-frame bg-white p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
        
        {/* Decorative elements - Top-left tag: preorder */}
        <div className="absolute top-6 left-6 text-[#eb5e45] font-mono text-xs font-extrabold uppercase tracking-widest">
          preorder
        </div>

        {/* Top-right sparkle */}
        <div className="absolute top-5 right-6 animate-sparkle" id="top-card-sparkle">
          <svg className="w-8 h-8 text-[#faca44] fill-[#faca44]" viewBox="0 0 24 24">
            <path d="M12 2l2.4 7.2L22 11.6l-5.6 5.4 1.8 7.5L12 20.2l-6.2 4.3 1.8-7.5-5.6-5.4 7.6-2.4z" />
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6 pt-5">
          
          {/* Hello plush tiles spelling layout */}
          <div className="flex justify-center space-x-3 mt-2" id="hello-tiles-row">
            {helloLetters.map((char, index) => (
              <div 
                key={index} 
                className="w-12 h-14 sm:w-14 sm:h-16 hello-tile text-center flex items-center justify-center text-3xl sm:text-4xl font-black select-none hover:-translate-y-1 hover:scale-105 active:translate-y-0.5 transition-all cursor-pointer"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {char}
              </div>
            ))}
          </div>

          {/* Titles & instructions */}
          <div className="text-center space-y-1 max-w-md">
            <h2 className="text-[#152033] text-xl sm:text-2xl font-black tracking-wide" id="search-card-title">
              @yomiie_core status
            </h2>
            <p className="text-[#8492a6] text-xs sm:text-sm font-medium font-sans">
              กรอกชื่อบัญชีเพื่อเช็คประวัติการสั่งซื้อและสถานะ
            </p>
          </div>

          {/* Rounded pink-tinted input box */}
          <div className="w-full relative max-w-sm" id="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Account (มี @)"
              disabled={isLoading}
              className={`w-full text-center block py-3.5 px-4 rounded-2xl font-sans font-medium text-base transition-all focus:ring-0 shadow-inner border-2 ${
                query.trim() 
                  ? 'bg-[#ffd3e0] border-[#db5984] text-[#152033] placeholder:text-gray-450 hover:border-[#c4406a] focus:border-[#c4406a] focus:bg-white' 
                  : 'bg-[#fff0f3] border-[#fbc3d0] text-gray-900 placeholder:text-gray-400 hover:border-[#f472b6] focus:border-[#f472b6] focus:bg-[#fff9fa]'
              }`}
              id="cute-search-field"
            />
            {query && (
              <button
                type="button"
                onClick={clearInput}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                title="ล้างข้อความ"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pastel Pink Pill Submit Button to Deep Pink */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`w-full max-w-sm flex items-center justify-center space-x-2 font-bold py-3.5 px-6 rounded-2xl transition-all select-none text-base border-2 ${
              query.trim() 
                ? 'bg-[#db5984] hover:bg-[#c4406a] text-white border-[#db5984] shadow-[0_6px_0_#b23c60] hover:shadow-[0_4px_0_#b23c60] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none cursor-pointer' 
                : 'bg-[#ffeef2] text-[#db5984] border-[#ffd3e0] opacity-80 cursor-not-allowed shadow-none'
            }`}
            id="cute-search-submit"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>ค้นหารายการ</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Bottom dashed line & update rate remarks */}
          <div className="w-full border-t-2 border-dashed border-[#f0f2f5] pt-4.5 text-center mt-2">
            <p className="text-[11px] sm:text-xs text-[#a0aec0] font-semibold tracking-wider uppercase font-sans">
              อัพเดทสถานะหลังสั่งซื้อ 1-3 วัน
            </p>
          </div>

        </form>

      </div>

      {/* Recommended Demo Search Tag Links of pre-orders list removed */}
    </div>
  );
};
