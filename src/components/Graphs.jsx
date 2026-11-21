import { useMemo, useState } from 'react';
import { BarChart3, ChevronDown, TrendingDown, TrendingUp } from 'lucide-react';
import { money } from '../utils/format';
import { formatHours } from '../utils/hours';
import { shortMonths, months } from '../store';
import MonthBar from './MonthBar';
import CategoryIcon from './CategoryIcon';

export default function Graphs({ state, onChangeMonth }) {
  const [scope, setScope] = useState('month');
  const [kind, setKind] = useState('expense');
  const [openCat, setOpenCat] = useState(null);

  const { currentMonth, currentYear } = state;
  const hourlyRate = state.hourlyRate || 0;
  const transactions = state.transactions ?? [];
  const categories = state.categories ?? [];

  const baseTx = useMemo(() => {
    return transactions.filter((t) => {
      if (scope === 'month') return t.month === currentMonth && t.year === currentYear;
      return t.year === currentYear;
    });
  }, [transactions, scope, currentMonth, currentYear]);

  const filtered = useMemo(() => {
    return baseTx.filter((t) => t.type === kind);
  }, [baseTx, kind]);

  const seriesByMonth = useMemo(() => {
    const arr = Array(12).fill(0);
    transactions.forEach((t) => {
      if (t.year !== currentYear) return;
      if (t.type !== kind) return;
      arr[t.month] += Number(t.amount) || 0;
    });
    return arr;
  }, [transactions, currentYear, kind]);

  const total = filtered.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalHours = hourlyRate > 0 ? total / hourlyRate : 0;

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const k = t.categoryId || '_none';
      map[k] = (map[k] || 0) + (Number(t.amount) || 0);
    });
    return Object.entries(map)
      .map(([id, value]) => ({
        id,
        name: categories.find((c) => c.id === id)?.name || 'Sem categoria',
        icon: categories.find((c) => c.id === id)?.icon,
        value,
        hours: hourlyRate > 0 ? value / hourlyRate : 0,
        items: filtered
          .filter((t) => (t.categoryId || '_none') === id)
          .sort((a, b) => String(b.date).localeCompare(String(a.date)) || (b.createdAt || 0) - (a.createdAt || 0)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filtered, categories, hourlyRate]);

  const maxBar = Math.max(1, ...seriesByMonth);
  const maxCat = Math.max(1, ...byCategory.map((c) => c.value));
  const shortDate = (iso) => (iso ? String(iso).split('-').reverse().slice(0, 2).join('/') : '');

  return (
    <div className="flex flex-col gap-5">
      <MonthBar month={currentMonth} year={currentYear} onChange={onChangeMonth} />
      <h1 className="text-4xl">Gráficos</h1>

      <div className="flex flex-wrap items-center gap-2">
        {[['expense', 'Gastos', <TrendingDown size={14} key="d" />], ['income', 'Ganhos', <TrendingUp size={14} key="u" />]].map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setKind(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm transition ${kind === id ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
          >
            {icon} {label}
          </button>
        ))}
        <div className="flex items-center gap-2 bg-white rounded-full pl-4 pr-3 py-2 shadow-sm ml-auto">
          <span className="text-sm font-semibold text-gray-600">Anual</span>
          <button onClick={() => setScope(scope === 'year' ? 'month' : 'year')} className={`w-11 h-6 rounded-full transition-colors relative ${scope === 'year' ? 'bg-black' : 'bg-gray-200'}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${scope === 'year' ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-5 shadow-sm text-center">
        <p className="text-gray-500 text-sm">
          Total {kind === 'expense' ? 'gasto' : 'ganho'} {scope === 'month' ? `em ${months[currentMonth]}` : `em ${currentYear}`}
        </p>
        <p className="font-display text-5xl mt-1" style={{ color: 'var(--accent-to)' }}>{money(total)}</p>

        {hourlyRate > 0 && kind === 'expense' && (
          <p className="text-sm font-bold text-gray-600 mt-2 bg-gray-100 inline-block px-3 py-1 rounded-full">
            = {formatHours(totalHours)} de trabalho
          </p>
        )}

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
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 flex flex-col items-center">
                    <span>{money(v)}</span>
                    {hourlyRate > 0 && kind === 'expense' && <span className="text-[8px] text-gray-300">{formatHours(v / hourlyRate)}</span>}
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
          <div className="flex flex-col divide-y divide-gray-100">
            {byCategory.map((c) => {
              const pct = (c.value / maxCat) * 100;
              const expanded = openCat === c.id;
              return (
                <div key={c.id} className="py-3">
                  <button className="w-full text-left" onClick={() => setOpenCat(expanded ? null : c.id)}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="flex items-center gap-2 text-sm font-semibold min-w-0 break-words">
                        <span className="shrink-0"><CategoryIcon name={c.icon} /></span>
                        <span className="min-w-0">{c.name}</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="font-bold text-sm block whitespace-nowrap">{money(c.value)}</span>
                          {hourlyRate > 0 && kind === 'expense' && (
                            <span className="text-[10px] text-gray-400 block">{formatHours(c.hours)}</span>
                          )}
                        </div>
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent-to)' }} />
                    </div>
                  </button>

                  {expanded && (
                    <div className="mt-3 flex flex-col gap-1 text-sm">
                      {c.items.map((t) => (
                        <div key={t.id} className="flex justify-between gap-2">
                          <span className="text-gray-600 min-w-0 break-words">
                            {t.note || c.name}
                            {t.installment && <span className="text-gray-400"> · {t.installment.n}/{t.installment.of}</span>}
                            {t.date && <span className="text-gray-400"> · {shortDate(t.date)}</span>}
                          </span>
                          <span className="font-semibold whitespace-nowrap">
                            {kind === 'expense' ? '-' : '+'}{money(t.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}