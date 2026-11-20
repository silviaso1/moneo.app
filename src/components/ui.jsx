import { CreditCard, Landmark, Minus, Plus } from 'lucide-react';

export const Switch = ({ on, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-12 h-7 shrink-0 rounded-full p-1 transition-colors ${on ? 'bg-black' : 'bg-gray-300'}`}
  >
    <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : ''}`} />
  </button>
);

export const field = 'w-full bg-[#f2f2f2] rounded-2xl px-4 py-3 outline-none';
export const fieldRound = 'w-full bg-white border border-gray-200 rounded-full px-5 py-4 outline-none text-[16px]';

export const Stepper = ({ value, onChange, min = 1, max = 60 }) => (
  <div className="flex items-center bg-white shadow-sm rounded-full border border-gray-100">
    <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-11 h-11 flex items-center justify-center">
      <Minus size={18} />
    </button>
    <span className="min-w-[44px] text-center font-bold">{value}x</span>
    <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="w-11 h-11 flex items-center justify-center">
      <Plus size={18} />
    </button>
  </div>
);

export function PayChips({ accounts, cards, value, onChange }) {
  const Chip = ({ id, icon, name }) => (
    <button
      type="button"
      onClick={() => onChange(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold border ${
        value === id ? 'bg-black text-white border-black' : 'bg-white border-gray-200'
      }`}
    >
      {icon} {name}
    </button>
  );
  return (
    <div className="flex gap-2 flex-wrap">
      {accounts.map((a) => <Chip key={a.id} id={a.id} name={a.name} icon={<Landmark size={16} />} />)}
      {cards.map((c) => <Chip key={c.id} id={c.id} name={`Cartão ${c.name}`} icon={<CreditCard size={16} />} />)}
    </div>
  );
}