import { useEffect, useRef, useState } from 'react';
import {
  Check, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Eye, EyeOff, Gauge, Minus, PieChart,
  PiggyBank, Plus, Receipt, Repeat, SlidersHorizontal, TrendingUp, Wallet,
  BarChart3, Users,
} from 'lucide-react';
import { money, moneyShort } from '../utils/format';
import { fmtShort } from '../utils/invoices';
import { SHORTCUTS, safeShortcuts } from '../utils/config';
import { months } from '../store';
import { brazilianBanks, getBankLogoUrl } from '../utils/banks';
import buildMessages from '../utils/mascotMessages';
import MonthBar from './MonthBar';
import CategoryIcon from './CategoryIcon';
import Mascot from './Mascot';

function ArcGauge({ percent, over, children }) {
  const cx = 120, cy = 120, r = 104;
  const pt = (deg) => {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  };
  const [x1, y1] = pt(-135);
  const [x2, y2] = pt(135);
  const d = `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative w-full max-w-[300px] aspect-square mx-auto">
      <svg viewBox="0 0 240 240" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lilac" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: 'var(--accent-from)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--accent-to)' }} />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="#E2E2E8" strokeWidth="14" strokeLinecap="round" pathLength="100" />
        {p > 0 && (
          <path
            d={d}
            fill="none"
            stroke={over ? '#E11D48' : 'url(#lilac)'}
            strokeWidth="14"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${p} 100`}
            style={{ transition: 'stroke-dasharray .6s ease, stroke .3s ease' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

function Card({ icon, title, action, onAction, children }) {
  return (
    <div className="bg-white rounded-[28px] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-600 font-semibold">{icon}{title}</div>
        {action && (
          <button onClick={onAction} className="flex items-center font-semibold text-sm">
            {action} <ChevronRight size={16} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard({
  state: rawState, percent, remaining, totalAvailable, mascotState, totalBalance, totalSaved,
  onChangeMonth, onToggleBalance, onToggleShowAll, onTab, onOpenModal,
  onToggleFixed, onNewFixed, onAddInvestment,
}) {
  // Garante que nenhum campo usado pelo Dashboard seja undefined
  const state = {
    ...rawState,
    accounts: rawState?.accounts ?? [],
    categories: rawState?.categories ?? [],
    fixeds: rawState?.fixeds ?? [],
    openInvoices: rawState?.openInvoices ?? [],
    monthTransactions: rawState?.monthTransactions ?? [],
    transactions: rawState?.transactions ?? [],
    categorySpent: rawState?.categorySpent ?? {},
    paidFixed: rawState?.paidFixed ?? {},
    limit: rawState?.limit ?? 0,
    spent: rawState?.spent ?? 0,
    income: rawState?.income ?? 0,
    sobra: rawState?.sobra ?? 0,
    dailySpent: rawState?.dailySpent ?? 0,
    fixedIncomeTotal: rawState?.fixedIncomeTotal ?? 0,
    fixedExpenseTotal: rawState?.fixedExpenseTotal ?? 0,
    yearSaved: rawState?.yearSaved ?? 0,
  };

  const [openCat, setOpenCat] = useState(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [idx, setIdx] = useState(0);
  const mascotRef = useRef(null);

  useEffect(() => {
    if (!state.followCursor) { setOff({ x: 0, y: 0 }); return; }
    const move = (e) => {
      const el = mascotRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const k = Math.min(8, dist / 20);
      setOff({ x: (dx / dist) * k, y: (dy / dist) * k });
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [state.followCursor]);

  const { currentMonth: month, currentYear: year } = state;

  useEffect(() => { setIdx(0); }, [month, year]);

  const today = new Date();
  const dim = new Date(year, month + 1, 0).getDate();
  const isCurrent = today.getMonth() === month && today.getFullYear() === year;
  const isPast = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());
  const daysLeft = isCurrent ? dim - today.getDate() + 1 : isPast ? 0 : dim;
  const elapsed = isCurrent ? today.getDate() / dim : isPast ? 1 : 0;
  const usage = state.limit > 0 ? state.spent / state.limit : 0;

  const over = remaining < 0;
  const badge = over ? 'Estourou o limite' : usage <= elapsed + 0.05 ? 'No ritmo' : 'Acima do ritmo';

  const shown = Math.abs(remaining);
  const whole = Math.floor(shown);
  const cents = String(Math.round((shown - whole) * 100)).padStart(2, '0');

  const messages = buildMessages({ state, remaining, daysLeft, isCurrent, totalSaved });
  const cur = ((idx % messages.length) + messages.length) % messages.length;
  const step = (d) => setIdx((i) => i + d);

  const expenseFixeds = state.fixeds.filter((f) => f.type !== 'income');
  const allPaid = expenseFixeds.length > 0 && expenseFixeds.every((f) => state.paidFixed[f.id]);
  const pendingCount = expenseFixeds.filter((f) => !state.paidFixed[f.id]).length;

  const catName = (id) => state.categories.find((c) => c.id === id)?.name || 'Sem categoria';
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const SC = {
    investment: { icon: <TrendingUp size={22} />, run: onAddInvestment },
    fixeds: { icon: <Repeat size={22} />, run: () => onTab('charts') },
    limits: { icon: <Gauge size={22} />, run: () => onTab('charts') },
    invoices: { icon: <CreditCard size={22} />, run: () => onTab('invoices') },
    expense: { icon: <Minus size={22} />, run: () => onOpenModal('modal-expense') },
    income: { icon: <Plus size={22} />, run: () => onOpenModal('modal-income') },
    statement: { icon: <Receipt size={22} />, run: () => onTab('statement') },
    investments: { icon: <PiggyBank size={22} />, run: () => onTab('investments') },
    planejar: { icon: <PieChart size={22} />, run: () => onTab('charts') },
    graphs: { icon: <BarChart3 size={22} />, run: () => onTab('graphs') },
    family: { icon: <Users size={22} />, run: () => onTab('family') },
    settings: { icon: <SlidersHorizontal size={22} />, run: () => onTab('settings') },
  };

  const Action = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2">
      <span className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center">{icon}</span>
      <span className="font-medium text-center text-sm">{label}</span>
    </button>
  );

  const Row = ({ title, sub, value, bold }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className={bold ? 'font-bold text-lg' : 'font-semibold'}>{title}</p>
        <p className="text-gray-400 text-sm">{sub}</p>
      </div>
      <p className={bold ? 'font-extrabold text-xl' : 'font-bold'}>{value}</p>
    </div>
  );

  const fixedSub = (f) => {
    const paid = state.paidFixed[f.id];
    if (!paid) return `dia ${f.day} · pendente`;
    const verb = f.type === 'income' ? 'recebido' : 'pago';
    const d = paid.date ? paid.date.split('-').reverse().slice(0, 2).join('/') : '';
    if (paid.late) return `dia ${f.day} · ${verb} com atraso em ${d}`;
    if (paid.dueDate && paid.date && paid.date !== paid.dueDate) return `dia ${f.day} · ${verb} antes em ${d}`;
    return `dia ${f.day} · ${verb}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <MonthBar month={month} year={year} onChange={onChangeMonth} onFilter={() => onTab('settings')} />

      <div className="relative bg-black text-white text-center rounded-3xl px-12 py-4 font-medium mx-2 min-h-[84px] flex flex-col items-center justify-center gap-2">
        <p key={`${cur}-${messages[cur]}`} className="msg-in">{messages[cur]}</p>
        {messages.length > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => step(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <ChevronRight size={18} />
            </button>
            <div className="flex gap-1">
              {messages.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${i === cur ? 'w-4' : 'w-1 bg-white/30'}`}
                  style={i === cur ? { background: 'var(--accent-from)' } : undefined}
                />
              ))}
            </div>
          </>
        )}
        <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-black rotate-45" />
      </div>

      <ArcGauge percent={percent} over={over}>
        <div
          ref={mascotRef}
          className="w-[42%] aspect-square transition-transform duration-100"
          style={{ transform: `translate(${off.x}px, ${off.y}px)` }}
        >
          <Mascot
            mood={mascotState}
            pack={state.mascotPack}
            custom={state.customMascots}
            color={state.mascotColor}
          />
        </div>
      </ArcGauge>

      <div className="text-center -mt-16">
        <p className="text-gray-600">{over ? 'Estourou em' : 'Pode gastar'}</p>
        <p className={`font-display text-6xl ${over ? 'text-rose-600' : ''}`}>
          {over && '-'}R$ {whole.toLocaleString('pt-BR')}
          <span className="text-3xl">,{cents}</span>
        </p>
        <p className="text-gray-400 mt-1">de {moneyShort(totalAvailable)} · {daysLeft} dias</p>
        <span className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 mt-3 text-sm font-semibold shadow-sm">
          {!over && <Check size={16} />} {badge}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-y-5">
        {safeShortcuts(state.shortcuts).map((id) => {
          const item = SC[id];
          if (!item) return null;
          return <Action key={id} icon={item.icon} label={SHORTCUTS[id]} onClick={item.run} />;
        })}
      </div>

      <Card icon={<Wallet size={18} />} title="O mês em uma conta">
        <div className="divide-y divide-gray-100">
          <Row
            title="Entra"
            sub={state.fixedIncomeTotal > 0 ? 'salário e fixos' : 'lance seu salário em Fixos'}
            value={`+${money(state.income)}`}
          />
          <Row
            title="Fixos"
            sub={expenseFixeds.length === 0 ? 'nenhum cadastrado' : allPaid ? 'tudo pago' : `${pendingCount} pendente(s)`}
            value={`-${money(state.fixedExpenseTotal)}`}
          />
          <Row title="Dia a dia" sub={`limite ${moneyShort(state.limit)}`} value={`-${money(state.dailySpent)}`} />
          <Row title="Sobra" sub="contando o que ainda vai entrar e sair" value={money(state.sobra)} bold />
        </div>
      </Card>

      <Card icon={<Gauge size={18} />} title="Limites do mês" action="Ajustar" onAction={() => onTab('charts')}>
        <div className="flex flex-col divide-y divide-gray-100">
          {state.categories.map((c) => {
            const spent = state.categorySpent[c.id] || 0;
            const pct = c.limit > 0 ? Math.min(100, (spent / c.limit) * 100) : spent > 0 ? 100 : 0;
            const isOver = c.limit > 0 && spent > c.limit;
            const expanded = openCat === c.id;
            const txs = state.monthTransactions
              .filter((t) => t.type === 'expense' && !t.fixedId && t.categoryId === c.id)
              .slice(0, 5);
            const fxs = state.fixeds.filter((f) => f.type !== 'income' && f.categoryId === c.id);
            return (
              <div key={c.id} className="py-3">
                <button className="w-full flex items-center gap-3 text-left" onClick={() => setOpenCat(expanded ? null : c.id)}>
                  <span className="w-12 h-12 shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                    <CategoryIcon name={c.icon} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">{c.name}</p>
                      <p className="text-sm whitespace-nowrap">
                        <span className={`font-bold ${isOver ? 'text-rose-600' : ''}`}>{moneyShort(spent)}</span>
                        <span className="text-gray-400"> de {moneyShort(c.limit)}</span>
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isOver ? 'bg-rose-600' : ''}`}
                        style={{ width: `${pct}%`, background: isOver ? undefined : 'var(--accent-to)' }}
                      />
                    </div>
                  </div>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div className="ml-[60px] mt-2 flex flex-col gap-1 text-sm">
                    {txs.length === 0 && fxs.length === 0 && <p className="text-gray-400">Nenhum gasto aqui.</p>}
                    {fxs.map((f) => (
                      <div key={f.id} className="flex justify-between">
                        <span className="text-gray-600 truncate">{f.name} (fixo)</span>
                        <span className="font-semibold">-{money(f.amount)}</span>
                      </div>
                    ))}
                    {txs.map((t) => (
                      <div key={t.id} className="flex justify-between">
                        <span className="text-gray-600 truncate">{t.note || catName(t.categoryId)}</span>
                        <span className="font-semibold">-{money(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {state.categories.length === 0 && <p className="text-gray-400 text-center py-3">Crie categorias em Ajustes.</p>}
        </div>
      </Card>

      <Card icon={<Repeat size={18} />} title="Fixos do mês" action="Gerenciar" onAction={() => onTab('charts')}>
        {state.fixeds.length === 0 ? (
          <div className="text-center pt-2">
            <p className="font-bold">Nenhum fixo cadastrado</p>
            <p className="text-gray-400 mt-1">Cadastre salário, aluguel e assinaturas em Planejar.</p>
            <button onClick={onNewFixed} className="mt-5 w-full bg-black text-white rounded-full py-4 font-semibold flex items-center justify-center gap-2">
              <Plus size={18} /> Novo fixo
            </button>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {state.fixeds.map((f) => {
              const paid = state.paidFixed[f.id];
              return (
                <button key={f.id} onClick={() => onToggleFixed(f)} className="flex items-center gap-3 text-left py-3">
                  <span className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center ${paid ? (paid.late ? 'bg-rose-600 border-rose-600 text-white' : 'bg-black border-black text-white') : 'border-gray-300'}`}>
                    {paid && <Check size={14} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{f.name}</p>
                    <p className={`text-sm ${paid?.late ? 'text-rose-500' : 'text-gray-400'}`}>{fixedSub(f)}</p>
                  </div>
                  <p className="font-bold whitespace-nowrap">{f.type === 'income' ? '+' : '-'}{money(f.amount)}</p>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {state.openInvoices.length > 0 && (
        <Card icon={<CreditCard size={18} />} title="Fatura aberta" action="Ver" onAction={() => onTab('invoices')}>
          <div className="flex flex-col divide-y divide-gray-100">
            {state.openInvoices.map((inv) => {
              const days = Math.ceil((inv.close - startToday) / 86400000);
              return (
                <button key={inv.card.id} onClick={() => onTab('invoices')} className="text-left py-3">
                  <p className="text-gray-500">Cartão {inv.card.name}</p>
                  <p className="font-display text-3xl">{money(inv.total)}</p>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>Fecha {fmtShort(inv.close)} (em {days} dias) · vence {fmtShort(inv.due)}</span>
                    <span>{inv.items.length} compras</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <Card icon={<Wallet size={18} />} title="Saldo nas contas">
        <div className="flex items-center justify-between py-2">
          <p className="font-display text-3xl">{state.hideTotalBalance ? 'R$ ••••' : money(totalBalance)}</p>
          <button onClick={onToggleBalance} className="w-10 h-10 rounded-full bg-[#f2f2f2] flex items-center justify-center">
            {state.hideTotalBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
          {(state.showAllAccounts ? state.accounts : state.accounts.slice(0, 3)).map((a) => {
            const bank = brazilianBanks.find((b) => b.name === a.name);
            const logoUrl = bank ? getBankLogoUrl(bank.ispb) : null;

            return (
              <div key={a.id} className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 font-medium">
                  <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={a.name}
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span
                      className={`w-3 h-3 rounded-full ${logoUrl ? 'hidden' : 'block'}`}
                      style={{ background: bank?.color || a.color || '#000' }}
                    />
                  </div>
                  {a.name}
                </span>
                <span className="font-semibold">{state.hideTotalBalance ? '••••' : money(a.balance)}</span>
              </div>
            );
          })}
        </div>
        {state.accounts.length > 3 && (
          <button onClick={onToggleShowAll} className="mt-2 text-sm font-semibold text-gray-500">
            {state.showAllAccounts ? 'Ver menos' : `Ver todas (${state.accounts.length})`}
          </button>
        )}
      </Card>

      {!state.hideSaved && (
        <button onClick={() => onTab('investments')} className="bg-white rounded-[28px] p-5 shadow-sm text-left">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-600 font-semibold"><PiggyBank size={18} /> Juros em {months[month].toLowerCase()}</span>
            <span className="flex items-center gap-1 font-bold">{money(totalSaved || 0)} <ChevronRight size={16} /></span>
          </div>
          <p className="text-gray-400 text-sm mt-1">No ano de {year}: {money(state.yearSaved)}</p>
        </button>
      )}
    </div>
  );
}