import { months } from '../store';

export default function MonthSelector({ currentMonth, onChange }) {
  return (
    <div className="flex items-center bg-white rounded-[20px] px-4 py-2 text-base font-bold border border-border shadow-sm">
      <button disabled={currentMonth === 0} onClick={() => onChange(-1)} className="px-3 disabled:opacity-30">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span>{months[currentMonth]}</span>
      <button disabled={currentMonth === 11} onClick={() => onChange(1)} className="px-3 disabled:opacity-30">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}