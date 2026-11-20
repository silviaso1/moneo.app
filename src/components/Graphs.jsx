import { useMemo, useState } from 'react';
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { money } from '../utils/format';
import { shortMonths, months } from '../store';
import MonthBar from './MonthBar';
import CategoryIcon from './CategoryIcon';

export default function Graphs({ state, onChangeMonth }) {
  const [scope, setScope] = useState('month');   
  const [kind, setKind] = useState('expense');   
  const [catFilter, setCatFilter] = useState('all');

  const { currentMonth, currentYear } = state;

  const baseTx = useMemo(() => {
    return state.transactions.filter((t) => {
      if (scope === 'month') return t.month === currentMonth && t.year === currentYear;
      return t.year === currentYear;
    });
  }, [state.transactions, scope, currentMonth, currentYear]);

  const filtered = useMemo(() => {
    return baseTx.filter((t) => {
      if (t.type !== kind) return false;
      if (catFilter !== 'all' && t.categoryId !== catFilter) return false;
      return true;
    });
  }, [baseTx, kind, catFilter]);

  const seriesByMonth = useMemo(() => {
    const arr = Array(12).fill(0);
    state.transactions.forEach((t) => {
      if (t.year !== currentYear) return;
      if (t.type !== kind) return;
      if (catFilter !== 'all' && t.categoryId !== catFilter) return;
      arr[t.month] += Number(t.amount) || 0;
    });
    return arr;
  }, [state.transactions, currentYear, kind, catFilter]);

  const total = filtered.reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const k = t.categoryId || '_none';
      map[k] = (map[k] || 0) + (Number(t.amount) || 0);
    });
    return Object.entries(map)
      .map(([id, value]) => ({
        id,
        name: state.categories.find((c) => c.id === id)?.name || 'Sem categoria',
        icon: state.categories.find((c) => c.id === id)?.icon,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filtered, state.categories]);

  const maxBar = Math.max(1, ...seriesByMonth);
  const maxCat = Math.max(1, ...byCategory.map((c) => c.value));

  return (
    <div className="flex flex-col gap-5">
      <MonthBar month={currentMonth} year={currentYear} onChange={onChangeMonth} />
      <h1 className="text-4xl">Gráficos</h1>

      <div className="bg-white rounded-[28px] p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex bg-[#f2f2f2] p-1 rounded-full w-fit">
            {[['expense', 'Gastos', <TrendingDown size={14} key="d"/>], ['income', 'Ganhos', <TrendingUp size={14} key="u"/>]].map(([id, label, icon]) => (
              <button key={id} onClick={() => setKind(id)} className={`px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-1 transition ${kind === id ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>
                {icon} {label}
              </button>
            ))}
          </div>

          {/* TOGGLE ANUAL NA DIREITA */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Anual</span>
            <button 
              onClick={() => setScope(scope === 'year' ? 'month' : 'year')}
              className={`w-11 h-6 rounded-full transition-colors relative ${scope === 'year' ? 'bg-black' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${scope === 'year' ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Categoria</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1" style={{ scrollBehavior: 'smooth' }}>
            <button 
              onClick={() => setCatFilter('all')} 
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition ${catFilter === 'all' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              Todas
            </button>
            {state.categories.map((c) => (
              <button 
                key={c.id} 
                onClick={() => setCatFilter(c.id)} 
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-1 transition ${catFilter === c.id ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              >
                <CategoryIcon name={c.icon} /> {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restante igual */}
      <div className="bg-white rounded-[28px] p-5 shadow-sm text-center">
        <p className="text-gray-500 text-sm">
          Total {kind === 'expense' ? 'gasto' : 'ganho'} {scope === 'month' ? `em ${months[currentMonth]}` : `em ${currentYear}`}
        </p>
        <p className="font-display text-5xl mt-1" style={{ color: 'var(--accent-to)' }}>{money(total)}</p>
        <p className="text-gray-400 text-sm mt-1">{filtered.length} lançamento(s)</p>
      </div>

      <div className="bg-white rounded-[28px] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-gray-600 font-semibold mb-6">
          <BarChart3 size={18} /> Por mês — {currentYear}
        </div>
        <div className="flex items-end justify-between gap-1 h-48">
          {seriesByMonth.map((v, i) => {
            const h = (v / maxBar) * 100;
            const active = i === currentMonth && scope === 'month';
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div
                  className="w-full rounded-t-md transition-all duration-300 relative"
                  style={{
                    height: `${Math.max(h, v > 0 ? 5 : 0)}%`,
                    backgroundColor: v > 0 ? 'var(--accent-to)' : '#f3f4f6',
                    opacity: active ? 1 : 0.6,
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                    {money(v)}
                  </div>
                </div>
                <span className={`text-[10px] ${active ? 'font-bold text-black' : 'text-gray-400'}`}>
                  {shortMonths[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-gray-600 font-semibold mb-4">
          <BarChart3 size={18} /> Por categoria
        </div>
        {byCategory.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Nenhum lançamento nesse filtro.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {byCategory.map((c) => {
              const pct = (c.value / maxCat) * 100;
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-2 text-sm font-semibold truncate">
                      <CategoryIcon name={c.icon} /> {c.name}
                    </span>
                    <span className="font-bold text-sm whitespace-nowrap">{money(c.value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent-to)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}