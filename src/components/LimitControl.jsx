import { formatCurrency } from '../utils/formatCurrency';

export default function LimitControl({ value, onChange }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-3 w-full">
        <input type="range" min="0" max="5000" step="50" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 accent-black" />
        <span className="text-sm font-bold text-black w-[80px] text-right">R$ {formatCurrency(value).split(',')[0]}</span>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <span className="text-[13px] text-[#8e8e93]">Ou digite:</span>
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-[120px] px-3 py-2 rounded-lg border border-[#e0e0e0] text-sm font-bold text-right outline-none focus:border-black text-black" />
      </div>
    </div>
  );
}