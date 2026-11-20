import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { months, shortMonths } from '../store';
import { pad } from '../utils/fixeds';
import { todayISO } from '../utils/format';

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [y0, m0, d0] = value.split('-').map(Number);
  const [view, setView] = useState({ y: y0, m: m0 - 1 });
  const today = todayISO();

  const first = new Date(view.y, view.m, 1).getDay();
  const dim = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];

  const go = (delta) => {
    let m = view.m + delta;
    let y = view.y;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setView({ y, m });
  };

  const pick = (d) => {
    onChange(`${view.y}-${pad(view.m + 1)}-${pad(d)}`);
    setOpen(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => { setView({ y: y0, m: m0 - 1 }); setOpen(!open); }}
        className="w-full bg-white border border-gray-200 rounded-full px-5 py-4 flex items-center justify-between text-[16px]"
      >
        <span>{d0} {shortMonths[m0 - 1]} {y0}</span>
        <CalendarDays size={18} className="text-gray-400" />
      </button>

      {open && (
        <div className="mt-2 bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => go(-1)} className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
            <p className="font-bold">{months[view.m]} {view.y}</p>
            <button type="button" onClick={() => go(1)} className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-1">
            {WEEK.map((w, i) => <span key={i} className="py-1">{w}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const iso = `${view.y}-${pad(view.m + 1)}-${pad(d)}`;
              const selected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(d)}
                  className={`mx-auto w-10 h-10 rounded-full text-sm font-semibold flex items-center justify-center ${
                    selected ? 'bg-black text-white' : isToday ? 'border border-black' : 'hover:bg-[#f2f2f2]'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-center">
            <button type="button" onClick={() => pick(Number(today.split('-')[2])) || onChange(today)} className="hidden" />
            <button
              type="button"
              onClick={() => { onChange(today); setOpen(false); }}
              className="font-semibold text-sm"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}