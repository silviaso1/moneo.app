import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className="mb-4 relative">
      {label && <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between bg-white"
      >
        <div className="flex items-center gap-2">
          {/* Renderiza a logo se existir, senão nada (ou a inicial) */}
          {selected.logoUrl ? (
            <img src={selected.logoUrl} alt={selected.label} className="w-6 h-6 object-contain" />
          ) : null}
          <span className="text-sm font-semibold text-black">{selected.label}</span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[110%] left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${value === opt.value ? 'bg-gray-50' : ''}`}
              >
                {opt.logoUrl ? (
                  <img src={opt.logoUrl} alt={opt.label} className="w-6 h-6 object-contain" />
                ) : null}
                <span className="text-sm text-black flex-1">{opt.label}</span>
                {value === opt.value && <Check size={16} className="text-black" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}