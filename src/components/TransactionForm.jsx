import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { moneyShort, money, todayISO, toNumber } from '../utils/format';
import { formatHours } from '../utils/hours';
import CategoryIcon from './CategoryIcon';
import DatePicker from './DatePicker';
import { AmountDisplay, Keypad } from './AmountPad';
import { Switch, Stepper, PayChips, fieldRound } from './ui';

export default function TransactionForm({
  accounts, cards = [], categories, initialType = 'expense', remaining = 0, hourlyRate = 0, onSubmit,
}) {
  const [type, setType] = useState(initialType);
  const [cents, setCents] = useState(0);
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || null);
  const [accountId, setAccountId] = useState(accounts[0]?.id || cards[0]?.id || null);
  const [more, setMore] = useState(true);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [n, setN] = useState(1);
  const [instValue, setInstValue] = useState('');
  const [receivable, setReceivable] = useState(false);
  const [recvAmount, setRecvAmount] = useState('');

  const isExp = type === 'expense';
  const total = cents / 100;
  const inst = toNumber(instValue);

  // Horas de trabalho que esse gasto custa
  const hours = isExp && hourlyRate > 0 && total > 0 ? total / hourlyRate : 0;

  const HoursAlert = hours > 0 ? (
    <div className="flex items-center justify-center gap-2 bg-amber-50 text-amber-800 rounded-2xl px-4 py-3 text-sm font-semibold mb-5">
      <Clock size={16} />
      <span>Isso custa <b>{formatHours(hours)}</b> do seu trabalho</span>
    </div>
  ) : null;

  const Toggle = (
    <div className="flex bg-[#f2f2f2] rounded-2xl p-1 mb-5">
      {[['expense', 'Gasto'], ['income', 'Receita']].map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => setType(id)}
          className={`flex-1 py-3 rounded-xl font-semibold ${type === id ? 'bg-white shadow-sm' : 'text-gray-400'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const Remaining = isExp ? (
    <p className="text-center text-gray-500 mb-5">
      Pode gastar no mês: <b className="text-black">{moneyShort(remaining)}</b>
    </p>
  ) : (
    <div className="mb-5" />
  );

  if (step === 1) {
    return (
      <div>
        {Toggle}
        <AmountDisplay cents={cents} setCents={setCents} />
        <div className="mt-1" />
        {Remaining}
        {HoursAlert}
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
    <div>
      {Toggle}
      <AmountDisplay cents={cents} setCents={setCents} active={false} />
      <div className="mt-1" />
      {Remaining}
      {HoursAlert}

      {isExp && categories.length > 0 && (
        <>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {categories.map((c) => (
              <button type="button" key={c.id} onClick={() => setCategoryId(c.id)} className="flex flex-col items-center gap-1 w-20 shrink-0">
                <span className={`w-14 h-14 rounded-full flex items-center justify-center ${categoryId === c.id ? 'bg-black text-white' : 'bg-[#f2f2f2]'}`}>
                  <CategoryIcon name={c.icon} />
                </span>
                <span className={`text-xs w-full truncate text-center ${categoryId === c.id ? 'font-bold text-black' : 'text-gray-500'}`}>{c.name}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 my-4" />
        </>
      )}

      <p className="font-semibold text-sm text-gray-600 mb-2">Conta</p>
      <PayChips accounts={accounts} cards={cards} value={accountId} onChange={setAccountId} />

      <div className="border-t border-gray-200 mt-4" />
      <button type="button" onClick={() => setMore(!more)} className="w-full flex items-center justify-between py-4 font-bold">
        Data, nota e mais <ChevronDown size={18} className={more ? 'rotate-180' : ''} />
      </button>

      {more && (
        <div className="flex flex-col pb-2">
          <div className="pb-4">
            <p className="font-semibold text-sm text-gray-600 mb-2">Nota</p>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: Uber pro metrô" className={fieldRound} />
          </div>

          <div className="pb-4">
            <p className="font-semibold text-sm text-gray-600 mb-2">Data</p>
            <DatePicker value={date} onChange={setDate} />
          </div>

          <div className="border-t border-gray-100 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{isExp ? 'Parcelado' : 'Vou receber parcelado'}</p>
                <p className="text-gray-400 text-sm">Divide o valor e lança nos próximos meses</p>
              </div>
              <Stepper value={n} onChange={setN} />
            </div>
            {n > 1 && (
              <div>
                <p className="font-semibold text-sm text-gray-600 mb-2">Valor de cada parcela (opcional)</p>
                <input
                  value={instValue}
                  onChange={(e) => setInstValue(e.target.value.replace(/[^\d,.]/g, ''))}
                  inputMode="decimal"
                  placeholder={`${money(total / n)} (sem juros)`}
                  className={fieldRound}
                />
                <p className="text-gray-400 text-sm mt-2">
                  {inst > 0 ? `Total com juros: ${money(inst * n)}` : 'Tem juros? Digite o valor real da parcela.'}
                </p>
              </div>
            )}
          </div>

          {isExp && (
            <div className="border-t border-gray-100 py-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold">Vou receber de volta</p>
                  <p className="text-gray-400 text-sm">Conta no limite até o reembolso cair</p>
                </div>
                <Switch on={receivable} onClick={() => setReceivable(!receivable)} />
              </div>
              {receivable && (
                <input
                  value={recvAmount}
                  onChange={(e) => setRecvAmount(e.target.value.replace(/[^\d,.]/g, ''))}
                  inputMode="decimal"
                  placeholder={`Quanto volta (R$) — vazio = ${money(total)}`}
                  className={fieldRound}
                />
              )}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={cents === 0 || (isExp && categories.length > 0 && !categoryId)}
        onClick={() =>
          onSubmit(type, {
            amount: total,
            categoryId: isExp ? categoryId : null,
            accountId,
            note,
            date,
            installments: n,
            installmentAmount: n > 1 ? inst : 0,
            receivable: isExp && receivable,
            receivableAmount: toNumber(recvAmount) || total,
          })
        }
        className="w-full mt-3 bg-black text-white rounded-full py-4 font-semibold disabled:opacity-30"
      >
        {isExp ? 'Lançar gasto' : 'Lançar receita'}
      </button>
    </div>
  );
}