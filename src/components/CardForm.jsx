import { useState } from 'react';
import { field } from './ui';

const COLORS = ['#8A05BE', '#EC7000', '#FF7A00', '#000000', '#0A84FF', '#16A34A', '#E11D48'];

export default function CardForm({ cardToEdit, onSubmit, onDelete }) {
  const [name, setName] = useState(cardToEdit?.name || '');
  const [closingDay, setClosingDay] = useState(String(cardToEdit?.closingDay ?? ''));
  const [dueDay, setDueDay] = useState(String(cardToEdit?.dueDay ?? ''));
  const [limit, setLimit] = useState(cardToEdit?.limit ? String(cardToEdit.limit) : '');
  const [color, setColor] = useState(cardToEdit?.color || '#000000');
  const digits = (v) => v.replace(/\D/g, '').slice(0, 2);

  return (
    <div className="flex flex-col gap-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (ex: Nubank)" className={field} />
      <div className="flex gap-3">
        <input value={closingDay} onChange={(e) => setClosingDay(digits(e.target.value))} inputMode="numeric" placeholder="Fecha dia" className={field} />
        <input value={dueDay} onChange={(e) => setDueDay(digits(e.target.value))} inputMode="numeric" placeholder="Vence dia" className={field} />
      </div>
      <input
        value={limit}
        onChange={(e) => setLimit(e.target.value.replace(/[^\d,.]/g, ''))}
        inputMode="decimal"
        placeholder="Limite do cartão (opcional)"
        className={field}
      />

      <div className="border-t border-gray-100 pt-4">
        <p className="font-semibold text-sm text-gray-600 mb-2">Cor</p>
        <div className="flex gap-3 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-black' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!name.trim() || !Number(closingDay) || !Number(dueDay)}
        onClick={() =>
          onSubmit(
            { name: name.trim(), closingDay: Number(closingDay), dueDay: Number(dueDay), limit: Number(limit.replace(',', '.')) || 0, color },
            cardToEdit?.id
          )
        }
        className="w-full bg-black text-white rounded-full py-4 font-semibold disabled:opacity-30"
      >
        Salvar
      </button>
      {cardToEdit && (
        <button
          type="button"
          onClick={() => window.confirm('Excluir cartão? Os lançamentos dele continuam salvos.') && onDelete(cardToEdit.id)}
          className="w-full text-rose-600 font-semibold py-2"
        >
          Excluir cartão
        </button>
      )}
    </div>
  );
}