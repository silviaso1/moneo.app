import { useState } from 'react';
import { ChevronDown, CreditCard, Pencil, Plus } from 'lucide-react';
import { months } from '../store';
import { money, moneyShort } from '../utils/format';
import { fmtShort } from '../utils/invoices';
import MonthBar from './MonthBar';

export default function Invoices({ state, onChangeMonth, onNewCard, onEditCard }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="flex flex-col gap-5">
      <MonthBar month={state.currentMonth} year={state.currentYear} onChange={onChangeMonth} />
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold">Faturas</h1>
        <button onClick={onNewCard} className="flex items-center font-semibold bg-white rounded-full px-4 py-2 shadow-sm">
          <Plus size={16} /> Novo cartão
        </button>
      </div>
      <p className="text-gray-400 -mt-3">Faturas que fecham em {months[state.currentMonth].toLowerCase()}.</p>

      {state.invoices.length === 0 ? (
        <div className="bg-white rounded-[28px] p-6 shadow-sm text-center">
          <p className="font-bold">Nenhum cartão cadastrado</p>
          <p className="text-gray-400 mt-1">Cadastre o nome e os dias de fechamento e vencimento. Sem número do cartão.</p>
          <button onClick={onNewCard} className="mt-5 w-full bg-black text-white rounded-full py-4 font-semibold flex items-center justify-center gap-2">
            <Plus size={18} /> Novo cartão
          </button>
        </div>
      ) : (
        state.invoices.map((inv) => {
          const expanded = open === inv.card.id;
          const usedPct = inv.card.limit > 0 ? Math.min(100, (inv.total / inv.card.limit) * 100) : 0;
          return (
            <div key={inv.card.id} className="bg-white rounded-[28px] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-gray-600 font-semibold">
                  <span className="w-3 h-3 rounded-full" style={{ background: inv.card.color || '#000' }} />
                  <CreditCard size={18} /> Cartão {inv.card.name}
                </span>
                <button onClick={() => onEditCard(inv.card)} className="text-gray-400 p-1"><Pencil size={16} /></button>
              </div>

              <p className="font-extrabold text-4xl">{money(inv.total)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold rounded-full px-3 py-1 ${inv.closed ? 'bg-gray-200 text-gray-600' : 'bg-black text-white'}`}>
                  {inv.closed ? 'Fechada' : 'Aberta'}
                </span>
                <span className="text-gray-400 text-sm">
                  Fecha {fmtShort(inv.close)} · vence {fmtShort(inv.due)}
                </span>
              </div>

              {inv.card.limit > 0 && (
                <div className="mt-4">
                  <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-black rounded-full" style={{ width: `${usedPct}%` }} />
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    {moneyShort(inv.total)} de {moneyShort(inv.card.limit)} de limite
                  </p>
                </div>
              )}

              <div className="border-t border-gray-100 mt-4">
                <button onClick={() => setOpen(expanded ? null : inv.card.id)} className="w-full flex items-center justify-between py-3 font-semibold">
                  {inv.items.length} compra(s)
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div className="flex flex-col divide-y divide-gray-100">
                    {inv.items.length === 0 && <p className="text-gray-400 py-2">Nenhuma compra nesta fatura.</p>}
                    {inv.items.map((t) => (
                      <div key={t.id} className="flex items-center justify-between py-3 gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">
                            {t.note || 'Compra'}
                            {t.installment && <span className="text-gray-400 font-normal"> · {t.installment.n}/{t.installment.of}</span>}
                          </p>
                          <p className="text-gray-400 text-sm">{t.date.split('-').reverse().slice(0, 2).join('/')}</p>
                        </div>
                        <p className="font-bold whitespace-nowrap">{money(t.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}