import { useMemo, useState } from 'react';
import { ArrowUpDown, Pencil, Plus, Trash2, TrendingUp, BarChart3 } from 'lucide-react';
import { months, shortMonths } from '../store';
import { money } from '../utils/format';
import { kindLabel } from '../utils/investmentTypes';
import MonthBar from './MonthBar';

export default function Investments({ state, onChangeMonth, onAdd, onEdit, onDelete }) {
  const [order, setOrder] = useState('desc'); // desc = mais recentes primeiro
  const hide = state.hideSaved;
  const show = (v) => (hide ? 'R$ ••••' : money(v));
  const monthTotal = state.monthInvestments.reduce((s, i) => s + (Number(i.amount ?? i.value ?? 0) || 0), 0);
  const max = Math.max(...state.yearByMonth, 1);
  const accName = (i) => state.accounts.find((a) => a.id === (i.accountId ?? i.account))?.name;
  const isoOf = (i) => i.date || (i.createdAt ? new Date(i.createdAt).toISOString().slice(0, 10) : '');
  const fmt = (i) => {
    const iso = isoOf(i);
    return iso ? iso.split('-').reverse().slice(0, 2).join('/') : '';
  };
  const fmtDate = (iso) => {
    if (!iso) return 'Sem data';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  };

  const groups = useMemo(() => {
    const g = {};
    state.monthInvestments.forEach((i) => {
      const k = isoOf(i);
      (g[k] = g[k] || []).push(i);
    });
    const dir = order === 'desc' ? -1 : 1;
    return Object.entries(g)
      .sort((a, b) => dir * a[0].localeCompare(b[0]))
      .map(([k, items]) => [k, [...items].sort((x, y) => dir * ((x.createdAt || 0) - (y.createdAt || 0)))]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.monthInvestments, order]);

  // soma por tipo de investimento (mês aberto)
  const byKind = useMemo(() => {
    const map = {};
    state.monthInvestments.forEach((i) => {
      const k = i.kind || '_none';
      map[k] = (map[k] || 0) + (Number(i.amount ?? i.value ?? 0) || 0);
    });
    return Object.entries(map)
      .map(([id, value]) => ({ id, name: id === '_none' ? 'Sem tipo' : kindLabel(id) || 'Outros', value }))
      .sort((a, b) => b.value - a.value);
  }, [state.monthInvestments]);
  const maxKind = Math.max(1, ...byKind.map((k) => k.value));

  return (
    <div className="flex flex-col gap-5">
      <MonthBar month={state.currentMonth} year={state.currentYear} onChange={onChangeMonth} />
      <div className="flex items-center justify-between">
        <h1 className="text-4xl">Investir</h1>
        <button onClick={onAdd} className="flex items-center font-semibold bg-white rounded-full px-4 py-2 shadow-sm">
          <Plus size={16} /> Novo 
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[28px] p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Rendeu em {months[state.currentMonth].toLowerCase()}</p>
          <p className="font-display text-2xl mt-1">{show(monthTotal)}</p>
        </div>
        <div className="bg-white rounded-[28px] p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Rendeu em {state.currentYear}</p>
          <p className="font-display text-2xl mt-1">{show(state.yearSaved)}</p>
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-5 shadow-sm">
        <span className="flex items-center gap-2 text-gray-600 font-semibold mb-4"><TrendingUp size={18} /> Mês a mês</span>
        <div className="flex items-end gap-1.5 h-28">
          {state.yearByMonth.map((v, i) => (
            <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1 group relative">
              {/* TOOLTIP DO VALOR */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                {show(v)}
              </div>
              <div
                className="w-full rounded-t-lg transition-all duration-300"
                style={{
                  height: `${v > 0 ? Math.max(6, (v / max) * 100) : 3}%`,
                  backgroundColor: i === state.currentMonth ? 'var(--accent-to)' : 'var(--accent-soft)',
                  opacity: v > 0 ? 1 : 0.35
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-2">
          {shortMonths.map((m, i) => (
            <span key={m} className={`flex-1 text-center text-[10px] ${i === state.currentMonth ? 'font-bold text-black' : 'text-gray-400'}`}>
              {m[0]}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-5 shadow-sm">
        <span className="flex items-center gap-2 text-gray-600 font-semibold mb-4"><BarChart3 size={18} /> Por tipo</span>
        {byKind.length === 0 ? (
          <p className="text-gray-400 text-center py-2">Nenhum rendimento neste mês.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {byKind.map((k) => (
              <div key={k.id}>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-sm font-semibold min-w-0 break-words">{k.name}</span>
                  <span className="font-bold text-sm whitespace-nowrap">{show(k.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(k.value / maxKind) * 100}%`, background: 'var(--accent-to)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-[28px] px-5 py-3 shadow-sm">
        <div className="flex items-center justify-between py-2">
          <p className="text-gray-600 font-semibold">Lançamentos de {months[state.currentMonth].toLowerCase()}</p>
          {state.monthInvestments.length > 1 && (
            <button
              onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 text-xs font-semibold bg-[#f2f2f2] rounded-full px-3 py-1.5"
            >
              <ArrowUpDown size={13} /> {order === 'desc' ? 'Mais recentes' : 'Mais antigos'}
            </button>
          )}
        </div>

        {state.monthInvestments.length === 0 ? (
          <div className="text-center py-6 border-t border-gray-100">
            <p className="font-bold">Nenhum rendimento neste mês</p>
            <p className="text-gray-400">Toque em Novo rendimento pra anotar.</p>
          </div>
        ) : (
          <div className="flex flex-col border-t border-gray-100">
            {groups.map(([iso, items]) => (
              <div key={iso || 'none'} className="pt-3">
                <p className="text-sm font-semibold text-gray-500 capitalize">{fmtDate(iso)}</p>
                <div className="flex flex-col divide-y divide-gray-100">
                  {items.map((i) => (
                    <div key={i.id} className="flex items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{i.note || i.name || 'Rendimento'}</p>
                        <p className="text-gray-400 text-sm truncate">
                          {[kindLabel(i.kind), fmt(i), accName(i)].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <p className="font-bold whitespace-nowrap text-black">+{show(i.amount ?? i.value ?? 0)}</p>
                      <button onClick={() => onEdit(i)} className="text-gray-400 p-1"><Pencil size={16} /></button>
                      <button
                        onClick={() => onDelete(i.id)}
                        className="text-gray-300 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}