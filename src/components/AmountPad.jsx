import { useEffect, useRef } from 'react';
import { Delete } from 'lucide-react';
import { money } from '../utils/format';

const MAX = 99999999;

export function AmountDisplay({ cents, setCents, active = true }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (/^\d$/.test(e.key)) setCents((c) => { const n = c * 10 + Number(e.key); return n > MAX ? c : n; });
      else if (e.key === 'Backspace') setCents((c) => Math.floor(c / 10));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, setCents]);

  return (
    <div className="relative w-full text-center cursor-text" onClick={() => ref.current?.focus()}>
      <p className={`font-extrabold text-5xl ${cents === 0 ? 'text-gray-300' : ''}`}>{money(cents / 100)}</p>
      <input
        ref={ref}
        value={cents === 0 ? '' : String(cents)}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/\D/g, '')) || 0;
          if (n <= MAX) setCents(n);
        }}
        inputMode="numeric"
        autoComplete="off"
        aria-label="Valor"
        className="absolute inset-0 w-full h-full opacity-0 cursor-text text-[16px]"
      />
    </div>
  );
}

export function Keypad({ setCents }) {
  const press = (d) => setCents((c) => { const n = Number(String(c) + d); return n > MAX ? c : n; });
  const add = (v) => setCents((c) => Math.min(MAX, c + v * 100));
  const back = () => setCents((c) => Math.floor(c / 10));

  const Key = ({ children, onClick, small }) => (
    <button
      type="button"
      onClick={onClick}
      className={`bg-[#f2f2f2] rounded-2xl flex items-center justify-center font-semibold active:bg-gray-200 ${small ? 'py-3 text-sm' : 'py-5 text-2xl'}`}
    >
      {children}
    </button>
  );

  return (
    <>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {[10, 20, 50, 100].map((v) => <Key key={v} small onClick={() => add(v)}>+{v}</Key>)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <Key key={n} onClick={() => press(n)}>{n}</Key>)}
        <Key onClick={() => press('00')}>00</Key>
        <Key onClick={() => press(0)}>0</Key>
        <Key onClick={back}><Delete size={24} /></Key>
      </div>
    </>
  );
}