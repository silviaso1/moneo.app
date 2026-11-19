import { shortMonths } from '../store';

export default function MonthBarChart({ values, activeIndex, color = '#000' }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex justify-between items-end h-[150px] mt-5 pt-5 border-t border-[#e0e0e0]">
      {values.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1">
          <div 
            className="w-full max-w-[30px] rounded-t transition-all" 
            style={{ 
              height: `${(val / max) * 100}%`, 
              background: i === activeIndex ? color : '#e0e0e0' 
            }} 
          />
          <span className="text-[10px] font-semibold text-[#8e8e93] uppercase">{shortMonths[i]}</span>
        </div>
      ))}
    </div>
  );
}