import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { brazilianBanks } from '../utils/banks';
import { toNumber } from '../utils/format';
import { BankLogo, CardBrand, CARD_BRANDS } from './CardBadge';
import { fieldRound } from './ui';

const COLORS = ['#000000', '#8A05BE', '#EC0000', '#FF7A00', '#0A6CFF', '#00A86B', '#FFC400', '#6B7280'];

export default function CardForm({ cardToEdit, onSubmit, onDelete }) {
  const [name, setName] = useState(cardToEdit?.name || '');
  const [bank, setBank] = useState(cardToEdit?.bank || '');
  const [brand, setBrand] = useState(cardToEdit?.brand || '');
  const [closingDay, setClosingDay] = useState(String(cardToEdit?.closingDay ?? ''));
  const [dueDay, setDueDay] = useState(String(cardToEdit?.dueDay ?? ''));
  const [limit, setLimit] = useState(cardToEdit?.limit ? String(cardToEdit.limit) : '');
  const [color, setColor] = useState(cardToEdit?.color || '#000000');

  const [query, setQuery] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return brazilianBanks.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const pickBank = (b) => {
    setBank(b.name);
    if (!name.trim()) setName(b.name);
    if (b.color && color === '#000000') setColor(b.color);
    setQuery('');
  };

  const finalName = name.trim() || bank;
  const canSave = !!finalName && Number(closingDay) >= 1 && Number(dueDay) >= 1;

  const submit = () => {
    if (!canSave) return;
    onSubmit(
      {
        name: finalName,
        bank: bank || null,
        brand: brand || null,
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
        limit: toNumber(limit) || 0,
        color,
      },
      cardToEdit?.id
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-semibold text-sm text-gray-600 mb-2">Nome do cartão</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Nubank, Itaú Platinum" className={fieldRound} />
      </div>

      <div>
        <p className="font-semibold text-sm text-gray-600 mb-2">Banco <span className="text-gray-400 font-normal">(opcional)</span></p>
        {bank ? (
          <div className="flex items-center gap-3 bg-[#f2f2f2] rounded-2xl px-4 py-3">
            <span className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
              <BankLogo name={bank} size={20} />
            </span>
            <span className="flex-1 font-semibold truncate">{bank}</span>
            <button type="button" onClick={() => setBank('')} className="text-gray-400 p-1"><X size={18} /></button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar banco..." className={`${fieldRound} pl-10`} />
            </div>
            {matches.length > 0 && (
              <div className="mt-2 flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {matches.map((b) => (
                  <button type="button" key={b.ispb ?? b.name} onClick={() => pickBank(b)} className="flex items-center gap-3 px-4 py-3 text-left bg-white">
                    <span className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      <BankLogo name={b.name} size={18} fallback={<span className="w-3 h-3 rounded-full" style={{ background: b.color || '#000' }} />} />
                    </span>
                    <span className="font-medium truncate">{b.name}</span>
                  </button>
                ))}
              </div>
            )}
            {query.trim() && matches.length === 0 && <p className="text-gray-400 text-sm mt-2">Nenhum banco encontrado.</p>}
          </>
        )}
      </div>

      <div>
        <p className="font-semibold text-sm text-gray-600 mb-2">Bandeira <span className="text-gray-400 font-normal">(opcional)</span></p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CARD_BRANDS).map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => setBrand(brand === id ? '' : id)}
              className={`flex items-center gap-2 pl-2 pr-3 py-2 rounded-full border text-sm font-semibold transition ${brand === id ? 'border-black bg-white shadow-sm' : 'border-gray-200 bg-[#f2f2f2] text-gray-500'}`}
            >
              <CardBrand brand={id} height={20} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-semibold text-sm text-gray-600 mb-2">Fecha no dia</p>
          <input type="number" min="1" max="31" inputMode="numeric" value={closingDay} onChange={(e) => setClosingDay(e.target.value)} placeholder="Ex.: 25" className={fieldRound} />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-600 mb-2">Vence no dia</p>
          <input type="number" min="1" max="31" inputMode="numeric" value={dueDay} onChange={(e) => setDueDay(e.target.value)} placeholder="Ex.: 5" className={fieldRound} />
        </div>
      </div>

      <div>
        <p className="font-semibold text-sm text-gray-600 mb-2">Limite <span className="text-gray-400 font-normal">(opcional)</span></p>
        <input value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^\d,.]/g, ''))} inputMode="decimal" placeholder="Ex.: 3000" className={fieldRound} />
      </div>

      <div>
        <p className="font-semibold text-sm text-gray-600 mb-2">Cor</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border transition ${color === c ? 'border-black ring-2 ring-offset-2 ring-gray-400' : 'border-gray-200'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <button type="button" disabled={!canSave} onClick={submit} className="w-full mt-1 bg-black text-white rounded-full py-4 font-semibold disabled:opacity-30">
        {cardToEdit ? 'Salvar cartão' : 'Adicionar cartão'}
      </button>

      {cardToEdit && onDelete && (
        confirmDel ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmDel(false)} className="flex-1 bg-gray-200 text-black rounded-full py-3 font-semibold">Cancelar</button>
            <button type="button" onClick={() => onDelete(cardToEdit.id)} className="flex-1 bg-rose-600 text-white rounded-full py-3 font-semibold">Excluir cartão</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmDel(true)} className="text-rose-600 font-semibold py-2">Excluir cartão</button>
        )
      )}
    </div>
  );
}