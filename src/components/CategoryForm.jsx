import { useState } from 'react';
import CategoryIcon, { ICONS } from './CategoryIcon';
import { field } from './ui';

export default function CategoryForm({ categoryToEdit, onSubmit, onDelete }) {
  const [name, setName] = useState(categoryToEdit?.name || '');
  const [icon, setIcon] = useState(categoryToEdit?.icon || 'Tag');
  const [limit, setLimit] = useState(categoryToEdit?.limit ? String(categoryToEdit.limit) : '');

  return (
    <div className="flex flex-col gap-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da categoria" className={field} />
      <input
        value={limit}
        onChange={(e) => setLimit(e.target.value.replace(/[^\d,.]/g, ''))}
        inputMode="decimal"
        placeholder="Limite mensal (R$)"
        className={field}
      />

      <div className="border-t border-gray-100 pt-4">
        <p className="font-semibold text-sm text-gray-600 mb-2">Ícone</p>
        <div className="grid grid-cols-6 gap-2">
          {Object.keys(ICONS).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setIcon(n)}
              className={`aspect-square rounded-2xl flex items-center justify-center ${icon === n ? 'bg-black text-white' : 'bg-[#f2f2f2]'}`}
            >
              <CategoryIcon name={n} size={20} />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!name.trim()}
        onClick={() => onSubmit({ name: name.trim(), icon, limit: Number(limit.replace(',', '.')) || 0 }, categoryToEdit?.id)}
        className="w-full bg-black text-white rounded-full py-4 font-semibold disabled:opacity-30"
      >
        Salvar
      </button>
      {categoryToEdit && (
        <button
          type="button"
          onClick={() => window.confirm('Excluir categoria? Os lançamentos antigos ficam como "Sem categoria".') && onDelete(categoryToEdit.id)}
          className="w-full text-rose-600 font-semibold py-2"
        >
          Excluir categoria
        </button>
      )}
    </div>
  );
}