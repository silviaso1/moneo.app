import { useState } from 'react';
import { todayISO } from '../utils/format';
import { pad } from '../utils/fixeds';
import { enabledInvTypes, INVESTMENT_TYPES } from '../utils/investmentTypes';
import { AmountDisplay, Keypad } from './AmountPad';
import DatePicker from './DatePicker';
import { PayChips, fieldRound } from './ui';

const amt = (i) => Number(i?.amount ?? i?.value ?? 0) || 0;
const isoFromMs = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function InvestmentForm({ accounts, investmentToEdit, investmentTypes, onSubmit }) {
  const i = investmentToEdit;
  const [step, setStep] = useState(i ? 2 : 1);
  const [cents, setCents] = useState(Math.round(amt(i) * 100));
  const [accountId, setAccountId] = useState(i?.accountId ?? i?.account ?? accounts[0]?.id ?? null);
  const [note, setNote] = useState(i?.note || i?.name || '');
  const [date, setDate] = useState(i?.date || (i?.createdAt ? isoFromMs(i.createdAt) : todayISO()));
  const [kind, setKind] = useState(i?.kind || null);

  // tipos ativos nos Ajustes (+ o tipo do lançamento que está sendo editado, se já foi desativado)
  const active = enabledInvTypes(investmentTypes);
  const extra = i?.kind && !active.some((t) => t.id === i.kind)
    ? INVESTMENT_TYPES.find((t) => t.id === i.kind)
    : null;
  const types = extra ? [...active, extra] : active;

  if (step === 1) {
    return (
      <div>
        <AmountDisplay cents={cents} setCents={setCents} />
        <p className="text-center text-gray-500 mt-1 mb-5">Quanto rendeu</p>
        <Keypad setCents={setCents} />
        <button
          type="button"
          disabled={cents === 0}
          onClick={() => setStep(2)}
          className="w-full mt-4 bg-black text-white rounded-full py-4 font-semibold disabled:opacity-30"
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <AmountDisplay cents={cents} setCents={setCents} active={false} />
      <p className="text-center text-gray-500 mt-1 mb-4">Rendimento do mês</p>

      <div className="border-t border-gray-100 py-4">
        <p className="font-semibold text-sm text-gray-600 mb-2">Em qual conta rendeu</p>
        {accounts.length === 0 ? (
          <p className="text-gray-400 text-sm">Cadastre uma conta em Ajustes para o valor cair nela.</p>
        ) : (
          <PayChips accounts={accounts} cards={[]} value={accountId} onChange={setAccountId} />
        )}
      </div>

      <div className="border-t border-gray-100 py-4">
        <p className="font-semibold text-sm text-gray-600 mb-2">Tipo de investimento</p>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setKind(kind === t.id ? null : t.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${kind === t.id ? 'bg-black text-white' : 'bg-[#f2f2f2]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-gray-400 text-xs mt-2">Não achou o seu? Ative mais tipos em Ajustes.</p>
      </div>

      <div className="border-t border-gray-100 py-4">
        <p className="font-semibold text-sm text-gray-600 mb-2">Nota</p>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: CDB Nubank" className={fieldRound} />
      </div>

      <div className="border-t border-gray-100 py-4">
        <p className="font-semibold text-sm text-gray-600 mb-2">Data</p>
        <DatePicker value={date} onChange={setDate} />
      </div>

      <button
        type="button"
        disabled={cents === 0}
        onClick={() => onSubmit({ amount: cents / 100, accountId, note, date, kind: kind || null }, i?.id)}
        className="w-full mt-2 bg-black text-white rounded-full py-4 font-semibold disabled:opacity-30"
      >
        Salvar
      </button>
    </div>
  );
}