import { useState } from 'react';
import { moneyShort } from '../utils/format';
import CategoryIcon from './CategoryIcon';
import { AmountDisplay, Keypad } from './AmountPad';
import { PayChips, field } from './ui';

export default function FixedForm({ fixedToEdit, accounts, cards = [], categories, monthLabel, onSubmit }) {
  const [step, setStep] = useState(fixedToEdit ? 2 : 1);
  const [type, setType] = useState(fixedToEdit?.type || 'expense');
  const [cents, setCents] = useState(Math.round((fixedToEdit?.amount || 0) * 100));
  const [name, setName] = useState(fixedToEdit?.name || '');
  const [day, setDay] = useState(String(fixedToEdit?.day ?? 1));
  const [categoryId, setCategoryId] = useState(fixedToEdit?.categoryId || null);
  const [accountId, setAccountId] = useState(fixedToEdit?.accountId || accounts[0]?.id || cards[0]?.id || null);
  const [note, setNote] = useState(fixedToEdit?.note || '');
  const isExp = type === 'expense';

  const Toggle = (
    <div className="flex bg-[#f2f2f2] rounded-2xl p-1 mb-5">
      {[['expense', 'Saída'], ['income', 'Entrada']].map(([id, label]) => (
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

  if (step === 1) {
    return (
      <div>
        {Toggle}
        <AmountDisplay cents={cents} setCents={setCents} />
        <p className="text-center text-gray-500 mt-1 mb-5">Valor que se repete todo mês</p>
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
      {Toggle}
      <AmountDisplay cents={cents} setCents={setCents} active={false} />
      <p className="text-center text-gray-500 mt-1 mb-4 text-sm">
        Vale a partir de {monthLabel} e repete todo mês até você desativar.
      </p>

      <div className="border-t border-gray-100 py-4 flex flex-col gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (ex: Aluguel, Salário)" className={field} />
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-600 whitespace-nowrap">Dia do mês</span>
          <input
            value={day}
            onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
            inputMode="numeric"
            className={`${field} !w-20 text-center`}
          />
        </div>
      </div>

      {isExp && categories.length > 0 && (
        <div className="border-t border-gray-100 py-4">
          <p className="font-semibold text-sm text-gray-600 mb-2">
            Categoria <span className="font-normal text-gray-400">(conta pro limite dela)</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full font-semibold border text-sm ${
                  categoryId === c.id ? 'bg-black text-white border-black' : 'bg-white border-gray-200'
                }`}
              >
                <CategoryIcon name={c.icon} size={16} /> {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 py-4">
        <p className="font-semibold text-sm text-gray-600 mb-2">Conta</p>
        <PayChips accounts={accounts} cards={cards} value={accountId} onChange={setAccountId} />
      </div>

      <div className="border-t border-gray-100 py-4">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Observação (opcional)" className={field} />
      </div>

      <button
        type="button"
        disabled={!name.trim() || cents === 0}
        onClick={() =>
          onSubmit(
            { name: name.trim(), amount: cents / 100, type, day: Number(day) || 1, categoryId: isExp ? categoryId : null, accountId, note },
            fixedToEdit?.id
          )
        }
        className="w-full bg-black text-white rounded-full py-4 font-semibold disabled:opacity-30"
      >
        {fixedToEdit ? `Salvar a partir de ${monthLabel}` : `Salvar (${moneyShort(cents / 100)}/mês)`}
      </button>
    </div>
  );
}