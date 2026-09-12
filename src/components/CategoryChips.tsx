import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CategoryChipsProps {
  categories: { id: string; label: string }[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    // In RTL, scrollLeft can be negative or 0 depending on browser
    const absScroll = Math.abs(scrollLeft);
    const maxScroll = scrollWidth - clientWidth - 5;
    setShowRightArrow(absScroll > 5);
    setShowLeftArrow(absScroll < maxScroll);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollBy = (offset: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 250);
    }
  };

  return (
    <div className="relative sticky top-14 z-30 bg-[#0f0f0f]/95 backdrop-blur-md px-3 md:px-5 py-2.5 border-b border-[#222222] select-none">
      {/* Right chevron gradient for RTL */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pr-3 pl-8 bg-gradient-to-l from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent">
          <button
            type="button"
            onClick={() => scrollBy(200)}
            className="p-1.5 rounded-full bg-[#272727] hover:bg-[#3f3f3f] text-white shadow-md transition-colors"
            title="قبلی"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Horizontal scrolling pill chips */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-[#272727] text-[#f1f1f1] hover:bg-[#383838]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Left chevron gradient for RTL */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-3 pr-8 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent">
          <button
            type="button"
            onClick={() => scrollBy(-200)}
            className="p-1.5 rounded-full bg-[#272727] hover:bg-[#3f3f3f] text-white shadow-md transition-colors"
            title="بعدی"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
