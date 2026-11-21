import { Gauge, Plus, Power, Repeat, Target, Trash2 } from 'lucide-react';
import { money, moneyShort } from '../utils/format';
import MonthBar from './MonthBar';
import CategoryIcon from './CategoryIcon';

export default function Planejar({
  state,
  onChangeMonth,
  onNewFixed,
  onEditFixed,
  onOffFixed,
  onOnFixed,
  onDeleteFixed,
  onLimitChange,
  onTotalLimitChange,
}) {
  const catName = (id) => state.categories.find((c) => c.id === id)?.name;
  const hasTotal = state.totalLimit != null;

  return (
    <div className="flex flex-col gap-5">
      <MonthBar
        month={state.currentMonth}
        year={state.currentYear}
        onChange={onChangeMonth}
      />

      <h1 className="text-4xl font-extrabold">Planejar</h1>

      <div className="bg-white rounded-[28px] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-2 text-gray-600 font-semibold">
            <Repeat size={18} /> Fixos e salário
          </span>

          <button
            onClick={onNewFixed}
            className="flex items-center font-semibold"
          >
            <Plus size={16} /> Novo
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f2f2f2] rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Entra por mês</p>
            <p className="font-extrabold text-xl">
              {money(state.fixedIncomeTotal)}
            </p>
          </div>

          <div className="bg-[#f2f2f2] rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Sai por mês</p>
            <p className="font-extrabold text-xl">
              {money(state.fixedExpenseTotal)}
            </p>
          </div>
        </div>

        {state.fixeds.length === 0 ? (
          <div className="text-center mt-6">
            <p className="font-bold">Nada cadastrado</p>
            <p className="text-gray-400 mt-1">
              Comece pelo salário e pelo aluguel. Eles aparecem todo mês no
              Início pra você marcar como pago.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 mt-4">
            {state.fixeds.map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-3">
                <button
                  onClick={() => onEditFixed(f)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="font-semibold truncate">{f.name}</p>

                  <p className="text-gray-400 text-sm truncate">
                    dia {f.day} · {f.type === 'income'
                      ? 'entrada'
                      : catName(f.categoryId) || 'saída'}
                    {f.note ? ` · ${f.note}` : ''}
                  </p>
                </button>

                <p className="font-bold whitespace-nowrap">
                  {f.type === 'income' ? '+' : '-'}{money(f.amount)}
                </p>

                <button
                  onClick={() => onOffFixed(f)}
                  className="text-gray-400 hover:text-rose-600 p-1"
                  title="Desativar"
                >
                  <Power size={18} />
                </button>

                <button
                  onClick={() => onDeleteFixed(f)}
                  className="text-gray-300 hover:text-rose-600 p-1"
                  title="Excluir definitivamente"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}

        {state.inactiveFixeds.length > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-500 mb-1">
              Desativados neste mês
            </p>

            <div className="flex flex-col divide-y divide-gray-100">
              {state.inactiveFixeds.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 py-3 opacity-70"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{f.name}</p>

                    <p className="text-gray-400 text-sm">
                      {f.type === 'income' ? '+' : '-'}
                      {money(f.amount)} · dia {f.day}
                    </p>
                  </div>

                  <button
                    onClick={() => onOnFixed(f)}
                    className="font-semibold text-sm bg-[#f2f2f2] rounded-full px-4 py-2"
                  >
                    Reativar
                  </button>

                  <button
                    onClick={() => onDeleteFixed(f)}
                    className="text-gray-300 hover:text-rose-600 p-1"
                    title="Excluir definitivamente"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[28px] p-5 shadow-sm">
        <span className="flex items-center gap-2 text-gray-600 font-semibold mb-2">
          <Gauge size={18} /> Limites do dia a dia
        </span>

        <p className="text-gray-400 text-sm mb-2">
          Os fixos com categoria contam no limite dela e no limite do mês. Mudou um limite? Vale a partir deste mês, os anteriores não mudam.
        </p>

        <div className="flex items-center gap-3 py-3 border-t border-gray-100">
          <span className="w-12 h-12 shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center">
            <Target size={20} />
          </span>

          <div className="flex-1 min-w-0">
            <p className="font-semibold">Limite do mês</p>

            <p className="text-gray-400 text-sm">
              {hasTotal
                ? `definido por você · categorias somam ${moneyShort(state.categoriesLimit)}`
                : 'soma dos limites por categoria'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#f2f2f2] rounded-xl px-3 py-2 w-28">
            <span className="text-gray-500 text-sm">R$</span>

            <input
              key={`total-${state.monthKey}-${state.totalLimit}-${state.categoriesLimit}`}
              defaultValue={hasTotal ? state.totalLimit : ''}
              placeholder={String(Math.round(state.categoriesLimit))}
              inputMode="decimal"
              onBlur={(e) => {
                const raw = e.target.value.trim().replace(',', '.');

                if (raw === '') {
                  if (hasTotal) onTotalLimitChange(null);
                  return;
                }

                const v = Number(raw) || 0;

                if (v !== Number(state.totalLimit)) {
                  onTotalLimitChange(v);
                }
              }}
              className="w-full bg-transparent outline-none font-bold text-right text-[16px]"
            />
          </div>
        </div>

        {hasTotal && (
          <button
            onClick={() => onTotalLimitChange(null)}
            className="text-sm font-semibold text-gray-500 pb-3"
          >
            Voltar a usar a soma das categorias
          </button>
        )}

        <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
          {state.categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-3">
              <span className="w-12 h-12 shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                <CategoryIcon name={c.icon} />
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.name}</p>

                <p className="text-gray-400 text-sm">
                  {moneyShort(state.categorySpent[c.id] || 0)} de{' '}
                  {moneyShort(c.limit)} este mês
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#f2f2f2] rounded-xl px-3 py-2 w-28">
                <span className="text-gray-500 text-sm">R$</span>

                <input
                  key={`${c.id}-${state.monthKey}-${c.limit}`}
                  defaultValue={c.limit}
                  inputMode="decimal"
                  onBlur={(e) => {
                    const v =
                      Number(String(e.target.value).replace(',', '.')) || 0;

                    if (v !== Number(c.limit)) {
                      onLimitChange(c.id, v);
                    }
                  }}
                  className="w-full bg-transparent outline-none font-bold text-right text-[16px]"
                />
              </div>
            </div>
          ))}

          {state.categories.length === 0 && (
            <p className="text-gray-400 text-center py-3">
              Crie categorias em Ajustes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}