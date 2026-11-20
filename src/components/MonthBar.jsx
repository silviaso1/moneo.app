import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { months } from '../store';

export default function MonthBar({ month, year, onChange, onFilter }) {
  const showYear = year !== new Date().getFullYear();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center bg-white rounded-full shadow-sm">
        <button onClick={() => onChange(-1)} className="w-10 h-10 flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>
        <span className="px-2 font-semibold min-w-[110px] text-center">
          {months[month]}
          {showYear && <span className="text-gray-400 font-normal"> {year}</span>}
        </span>
        <button onClick={() => onChange(1)} className="w-10 h-10 flex items-center justify-center">
          <ChevronRight size={18} />
        </button>
      </div>
      {onFilter && (
        <button onClick={onFilter} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <SlidersHorizontal size={18} />
        </button>
      )}
    </div>
  );
}