import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Search, Trash2 } from 'lucide-react';
import { months } from '../store';
import { money } from '../utils/format';
import MonthBar from './MonthBar';
import CategoryIcon from './CategoryIcon';

export default function Transactions({ state, onChangeMonth, onDelete, onReceived }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState(null);

  const where = (t) =>
    state.accounts.find((a) => a.id === t.accountId)?.name ||
    (state.cards.find((c) => c.id === t.cardId) ? `Cartão ${state.cards.find((c) => c.id === t.cardId).name}` : '');

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.monthTransactions.filter((t) => {
      if (filter && t.type !== filter) return false;
      if (!term) return true;
      const cat = state.categories.find((c) => c.id === t.categoryId)?.name || '';
      return [t.note, cat, where(t)].some((s) => String(s || '').toLowerCase().includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.monthTransactions, state.categories, state.accounts, state.cards, q, filter]);

  const groups = useMemo(() => {
    const g = {};
    list.forEach((t) => { (g[t.date] = g[t.date] || []).push(t); });
    return Object.entries(g);
  }, [list]);

  const fmtDate = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  };

  const Chip = ({ id, icon, label }) => (
    <button
      onClick={() => setFilter(filter === id ? null : id)}
      className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold shadow-sm ${filter === id ? 'bg-black text-white' : 'bg-white'}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <MonthBar month={state.currentMonth} year={state.currentYear} onChange={onChangeMonth} />
      <h1 className="text-4xl font-extrabold">Transações</h1>

      <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
        <Search size={20} className="text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nota, categoria ou conta"
          className="flex-1 bg-transparent outline-none text-[16px]"
        />
      </div>

      <div className="flex gap-3">
        <Chip id="expense" icon={<ArrowUpRight size={16} />} label="Gastos" />
        <Chip id="income" icon={<ArrowDownLeft size={16} />} label="Receitas" />
      </div>

      {groups.length === 0 ? (
        <div className="text-center mt-10">
          <p className="font-bold">Nenhum lançamento em {months[state.currentMonth].toLowerCase()}</p>
          <p className="text-gray-400">Toque em + pra anotar.</p>
        </div>
      ) : (
        groups.map(([date, items]) => (
          <div key={date} className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-500 capitalize">{fmtDate(date)}</p>
            <div className="bg-white rounded-[28px] px-4 py-1 shadow-sm flex flex-col divide-y divide-gray-100">
              {items.map((t) => {
                const cat = state.categories.find((c) => c.id === t.categoryId);
                const isExp = t.type === 'expense';
                const future = t.accountId && t.applied === false;
                return (
                  <div key={t.id} className="flex items-center gap-3 py-3">
                    <span className="w-12 h-12 shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                      {cat ? <CategoryIcon name={cat.icon} /> : isExp ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {t.note || cat?.name || (isExp ? 'Gasto' : 'Receita')}
                        {t.installment && <span className="text-gray-400 font-normal"> · {t.installment.n}/{t.installment.of}</span>}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        {[cat?.name, where(t), future ? 'agendado' : null].filter(Boolean).join(' · ') || '—'}
                      </p>
                      {t.receivable && t.receivableAmount > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold bg-[#f2f2f2] rounded-full px-2 py-0.5">
                            {t.received ? 'recebido de volta' : `a receber ${money(t.receivableAmount)}`}
                          </span>
                          {!t.received && (
                            <button onClick={() => onReceived(t)} className="text-xs font-bold underline">Recebi</button>
                          )}
                        </div>
                      )}
                    </div>
                    <p className={`font-bold whitespace-nowrap ${isExp ? '' : 'text-emerald-600'}`}>
                      {isExp ? '-' : '+'}{money(t.amount)}
                    </p>
                    <button
                      onClick={() =>
                        window.confirm(t.installment ? 'Excluir só esta parcela?' : 'Excluir este lançamento?') && onDelete(t)
                      }
                      className="text-gray-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}