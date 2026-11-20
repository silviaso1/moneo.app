import { Pencil, Plus, Trash2, TrendingUp } from 'lucide-react';
import { months, shortMonths } from '../store';
import { money } from '../utils/format';
import MonthBar from './MonthBar';

export default function Investments({ state, onChangeMonth, onAdd, onEdit, onDelete }) {
  const hide = state.hideSaved;
  const show = (v) => (hide ? 'R$ ••••' : money(v));
  const monthTotal = state.monthInvestments.reduce((s, i) => s + (Number(i.amount ?? i.value ?? 0) || 0), 0);
  const max = Math.max(...state.yearByMonth, 1);
  const accName = (i) => state.accounts.find((a) => a.id === (i.accountId ?? i.account))?.name;
  const fmt = (i) => {
    const iso = i.date || (i.createdAt ? new Date(i.createdAt).toISOString().slice(0, 10) : '');
    return iso ? iso.split('-').reverse().slice(0, 2).join('/') : '';
  };

  return (
    <div className="flex flex-col gap-5">
      <MonthBar month={state.currentMonth} year={state.currentYear} onChange={onChangeMonth} />
      <div className="flex items-center justify-between">
        <h1 className="text-4xl">Juros</h1>
        <button onClick={onAdd} className="flex items-center font-semibold bg-white rounded-full px-4 py-2 shadow-sm">
          <Plus size={16} /> Novo rendimento
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
            <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
              <div
                className={`w-full rounded-t-lg ${i === state.currentMonth ? 'bg-black' : 'bg-violet-300'}`}
                style={{ height: `${v > 0 ? Math.max(6, (v / max) * 100) : 3}%`, opacity: v > 0 ? 1 : 0.35 }}
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

      <div className="bg-white rounded-[28px] px-5 py-3 shadow-sm">
        <p className="text-gray-600 font-semibold py-2">Lançamentos de {months[state.currentMonth].toLowerCase()}</p>
        {state.monthInvestments.length === 0 ? (
          <div className="text-center py-6 border-t border-gray-100">
            <p className="font-bold">Nenhum rendimento neste mês</p>
            <p className="text-gray-400">Toque em Novo rendimento pra anotar.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
            {state.monthInvestments.map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{i.note || i.name || 'Rendimento'}</p>
                  <p className="text-gray-400 text-sm truncate">{[fmt(i), accName(i)].filter(Boolean).join(' · ')}</p>
                </div>
                <p className="font-bold whitespace-nowrap text-emerald-600">+{show(i.amount ?? i.value ?? 0)}</p>
                <button onClick={() => onEdit(i)} className="text-gray-400 p-1"><Pencil size={16} /></button>
                <button
                  onClick={() => window.confirm('Excluir este rendimento?') && onDelete(i.id)}
                  className="text-gray-300 hover:text-rose-600 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}