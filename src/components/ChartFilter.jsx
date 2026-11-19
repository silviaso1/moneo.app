import { months } from '../store';

export default function ChartFilter({ month, year, onMonthChange, onYearChange, years = ['2026', '2025'] }) {
  return (
    <div className="flex justify-between items-center mb-5">
      <div className="flex items-center bg-white rounded-[20px] px-4 py-2 text-sm font-bold border border-border shadow-sm gap-2">
        <select value={month} onChange={(e) => onMonthChange(e.target.value)} className="bg-transparent border-none text-sm font-bold outline-none cursor-pointer">
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>
      <div className="flex items-center bg-white rounded-[20px] px-4 py-2 text-sm font-bold border border-border shadow-sm gap-2">
        <select value={year} onChange={(e) => onYearChange(e.target.value)} className="bg-transparent border-none text-sm font-bold outline-none cursor-pointer">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}