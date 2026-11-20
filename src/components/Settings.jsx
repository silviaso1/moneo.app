import {
  ChevronDown, ChevronRight, ChevronUp, CreditCard, Landmark, LayoutGrid, LogOut, Menu, Plus, Trash2, X,
} from 'lucide-react';
import { money } from '../utils/format';
import { SHORTCUTS, NAV, safeShortcuts, safeNav } from '../utils/config';
import MonthBar from './MonthBar';
import CategoryIcon from './CategoryIcon';
import GoogleLink from './GoogleLink';
import { Switch } from './ui';

function Section({ icon, title, onNew, children }) {
  return (
    <div className="bg-white rounded-[28px] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-gray-600 font-semibold">{icon}{title}</span>
        {onNew && <button onClick={onNew} className="flex items-center font-semibold"><Plus size={16} /> Nova</button>}
      </div>
      {children}
    </div>
  );
}

const SLOTS = ['Esquerda 1', 'Esquerda 2', 'Direita 1', 'Direita 2'];

export default function Settings({
  state, onChangeMonth,
  onAddAccount, onEditAccount, onDeleteAccount, onMoveAccount,
  onAddCard, onEditCard,
  onAddCategory, onEditCategory,
  onSaveShortcuts, onSaveNav,
  onToggleFollow, onToggleSaved, onLogout,
}) {
  const sc = safeShortcuts(state.shortcuts);
  const nav = safeNav(state.navItems);

  const moveSc = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= sc.length) return;
    const next = [...sc];
    [next[i], next[j]] = [next[j], next[i]];
    onSaveShortcuts(next);
  };
  const removeSc = (id) => sc.length > 1 && onSaveShortcuts(sc.filter((x) => x !== id));
  const addSc = (id) => sc.length < 4 && onSaveShortcuts([...sc, id]);

  const setSlot = (i, id) => {
    const next = [...nav];
    const j = next.indexOf(id);
    if (j >= 0) next[j] = next[i];
    next[i] = id;
    onSaveNav(next);
  };

  return (
    <div className="flex flex-col gap-5">
      <MonthBar month={state.currentMonth} year={state.currentYear} onChange={onChangeMonth} />
      <h1 className="text-4xl font-extrabold">Ajustes</h1>

      <Section icon={<Landmark size={18} />} title="Contas e cartões" onNew={onAddAccount}>
        <div className="flex flex-col divide-y divide-gray-100">
          {state.cards.map((c) => (
            <button key={c.id} onClick={() => onEditCard(c)} className="flex items-center gap-3 text-left py-3">
              <span className="w-12 h-12 shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                <CreditCard size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">Cartão {c.name}</p>
                <p className="text-gray-400 text-sm">Cartão · fecha dia {c.closingDay} · vence dia {c.dueDay}</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}

          {state.accounts.map((a, i) => (
            <div key={a.id} className="flex items-center gap-2 py-3">
              <button onClick={() => onEditAccount(a)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                <span className="w-12 h-12 shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                  <span className="w-4 h-4 rounded-full" style={{ background: a.color || '#000' }} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{a.name}</p>
                  <p className="text-gray-400 text-sm">Conta · {money(a.balance)}</p>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              <div className="flex flex-col">
                <button disabled={i === 0} onClick={() => onMoveAccount(a.id, -1)} className="disabled:opacity-20"><ChevronUp size={16} /></button>
                <button disabled={i === state.accounts.length - 1} onClick={() => onMoveAccount(a.id, 1)} className="disabled:opacity-20"><ChevronDown size={16} /></button>
              </div>
              <button
                onClick={() => window.confirm(`Excluir a conta "${a.name}"?`) && onDeleteAccount(a.id)}
                className="text-gray-300 hover:text-rose-600 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {state.accounts.length === 0 && state.cards.length === 0 && (
            <p className="text-gray-400 text-center py-3">Nenhuma conta ainda.</p>
          )}
        </div>
        <button onClick={onAddCard} className="mt-2 w-full border-t border-gray-100 pt-4 flex items-center justify-center gap-1 font-semibold">
          <Plus size={16} /> Novo cartão de crédito
        </button>
      </Section>

      <Section icon={<span className="text-base">▦</span>} title="Categorias" onNew={onAddCategory}>
        <p className="text-gray-400 text-sm mb-1">Gastos</p>
        <div className="flex flex-col divide-y divide-gray-100">
          {state.categories.map((c) => (
            <button key={c.id} onClick={() => onEditCategory(c)} className="flex items-center gap-3 text-left py-3">
              <span className="w-12 h-12 shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                <CategoryIcon name={c.icon} />
              </span>
              <p className="flex-1 font-semibold truncate">{c.name}</p>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<LayoutGrid size={18} />} title="Atalhos do início">
        <p className="text-gray-400 text-sm mb-1">Até 4 botões embaixo do Pode gastar. Use as setas para ordenar.</p>
        <div className="flex flex-col divide-y divide-gray-100">
          {sc.map((id, i) => (
            <div key={id} className="flex items-center gap-2 py-3">
              <p className="flex-1 font-semibold">{SHORTCUTS[id]}</p>
              <button disabled={i === 0} onClick={() => moveSc(i, -1)} className="disabled:opacity-20 p-1"><ChevronUp size={18} /></button>
              <button disabled={i === sc.length - 1} onClick={() => moveSc(i, 1)} className="disabled:opacity-20 p-1"><ChevronDown size={18} /></button>
              <button disabled={sc.length === 1} onClick={() => removeSc(id)} className="disabled:opacity-20 text-gray-400 p-1"><X size={18} /></button>
            </div>
          ))}
        </div>
        {sc.length < 4 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-500 mb-2">Adicionar</p>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(SHORTCUTS).filter((id) => !sc.includes(id)).map((id) => (
                <button key={id} onClick={() => addSc(id)} className="px-4 py-2 rounded-full border border-gray-200 font-semibold text-sm flex items-center gap-1">
                  <Plus size={14} /> {SHORTCUTS[id]}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section icon={<Menu size={18} />} title="Barra de navegação">
        <p className="text-gray-400 text-sm mb-1">O botão + fica sempre no meio. Escolha o que aparece em cada lugar.</p>
        <div className="flex flex-col divide-y divide-gray-100">
          {SLOTS.map((label, i) => (
            <div key={label} className="py-3">
              <p className="text-sm font-semibold text-gray-500 mb-2">{label}</p>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(NAV).map((id) => (
                  <button
                    key={id}
                    onClick={() => setSlot(i, id)}
                    className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                      nav[i] === id ? 'bg-black text-white border-black' : 'bg-white border-gray-200'
                    }`}
                  >
                    {NAV[id]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Preferências">
        <div className="flex flex-col divide-y divide-gray-100">
          <div className="flex items-center justify-between py-3">
            <span className="font-medium">Mascote segue o cursor</span>
            <Switch on={state.followCursor} onClick={onToggleFollow} />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-medium">Ocultar guardado</span>
            <Switch on={state.hideSaved} onClick={onToggleSaved} />
          </div>
        </div>
      </Section>

      <Section title="Conta Google">
        <GoogleLink />
      </Section>

      <button onClick={onLogout} className="flex items-center justify-center gap-2 bg-white rounded-full py-4 font-semibold shadow-sm text-rose-600">
        <LogOut size={18} /> Sair
      </button>
    </div>
  );
}