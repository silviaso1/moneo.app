import { useState } from 'react';
import DatePicker from './DatePicker';
import { pad } from '../utils/fixeds';
import { todayISO } from '../utils/format';

export default function PayFixedForm({ fixed, month, year, onChoose }) {
  const [other, setOther] = useState(false);
  const [date, setDate] = useState(todayISO());

  const dim = new Date(year, month + 1, 0).getDate();
  const day = Math.min(fixed?.day || 1, dim);
  const dueISO = `${year}-${pad(month + 1)}-${pad(day)}`;
  const dueLabel = `${pad(day)}/${pad(month + 1)}`;
  const inc = fixed?.type === 'income';

  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-500">
        {inc ? 'Quando você recebeu' : 'Quando você pagou'} <b className="text-black">{fixed?.name}</b>?
      </p>

      <button type="button" onClick={() => onChoose(dueISO)} className="w-full bg-black text-white rounded-2xl py-4 font-semibold">
        No vencimento (dia {dueLabel})
      </button>

      {!other ? (
        <button type="button" onClick={() => setOther(true)} className="w-full bg-[#f2f2f2] rounded-2xl py-4 font-semibold">
          {inc ? 'Recebi em outra data' : 'Paguei em outra data'}
        </button>
      ) : (
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <DatePicker value={date} onChange={setDate} />
          {date > dueISO && <p className="text-sm font-semibold text-rose-600">Fica registrado como atrasado.</p>}
          {date < dueISO && <p className="text-sm font-semibold text-gray-500">Fica registrado como antecipado.</p>}
          <button type="button" onClick={() => onChoose(date)} className="w-full bg-black text-white rounded-full py-4 font-semibold">
            Confirmar
          </button>
        </div>
      )}

      <p className="text-gray-400 text-sm text-center">A data escolhida vira a data do lançamento nas Transações.</p>
    </div>
  );
}