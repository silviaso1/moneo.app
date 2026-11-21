import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { brazilianBanks } from '../utils/banks';
import { toNumber } from '../utils/format';
import { BankLogo } from './CardBadge';
import { fieldRound } from './ui';

const COLORS = ['#000000', '#8A05BE', '#EC0000', '#FF7A00', '#0A6CFF', '#00A86B', '#FFC400', '#6B7280'];

export default function AccountForm({ accountToEdit, onSubmit }) {
  const [name, setName] = useState(accountToEdit?.name || '');
  const [balance, setBalance] = useState(
    accountToEdit?.balance != null ? String(accountToEdit.balance).replace('.', ',') : ''
  );
  const [color, setColor] = useState(accountToEdit?.color || '#000000');
  const [focus, setFocus] = useState(false);

  // banco cadastrado = nome exatamente igual ao de um banco da lista
  const picked = useMemo(
    () => brazilianBanks.find((b) => b.name === name.trim()) || null,
    [name]
  );

  // busca enquanto digita o nome
  const matches = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q || picked) return [];
    return brazilianBanks.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 6);
  }, [name, picked]);

  const pick = (b) => {
    setName(b.name);
    if (b.color) setColor(b.color);
    setFocus(false);
  };

  const canSave = name.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    onSubmit({ name: name.trim(), balance: toNumber(balance) || 0, color }, accountToEdit?.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-semibold text-sm text-gray-600 mb-2">Banco ou nome da conta</p>
        <div className="relative">
          {picked ? (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
              <BankLogo name={picked.name} size={18} />
            </span>
          ) : (
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          )}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setTimeout(() => setFocus(false), 150)}
            placeholder="Pesquise o banco: Nubank, Itaú, Inter..."
            className={`${fieldRound} ${picked ? 'pl-12' : 'pl-10'} pr-10`}
          />
          {name && (
            <button type="button" onClick={() => setName('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
              <X size={16} />
            </button>
          )}
        </div>

        {focus && matches.length > 0 && (
          <div className="mt-2 flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {matches.map((b) => (
              <button
                type="button"
                key={b.ispb ?? b.name}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(b)}
                className="flex items-center gap-3 px-4 py-3 text-left bg-white"
              >
                <span className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  <BankLogo name={b.name} size={18} fallback={<span className="w-3 h-3 rounded-full" style={{ background: b.color || '#000' }} />} />
                </span>
                <span className="font-medium truncate">{b.name}</span>
              </button>
            ))}
          </div>
        )}

        <p className="text-gray-400 text-xs mt-2">
          {picked ? 'Banco encontrado. O logo aparece nos Ajustes.' : 'Não achou o banco? Digite o nome que quiser (ex.: Carteira, Cofrinho).'}
        </p>
      </div>

      <div>
        <p className="font-semibold text-sm text-gray-600 mb-2">Saldo atual (R$)</p>
        <input
          value={balance}
          onChange={(e) => setBalance(e.target.value.replace(/[^\d,.-]/g, ''))}
          inputMode="decimal"
          placeholder="0,00"
          className={fieldRound}
        />
      </div>

      {!picked && (
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
      )}

      <button type="button" disabled={!canSave} onClick={submit} className="w-full mt-1 bg-black text-white rounded-full py-4 font-semibold disabled:opacity-30">
        {accountToEdit ? 'Salvar conta' : 'Adicionar conta'}
      </button>
    </div>
  );
}