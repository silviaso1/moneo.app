import { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ options, value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Fecha se clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="mb-5 relative" ref={ref}>
      <label className="block text-sm font-semibold text-black mb-2">{label}</label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 rounded-2xl border border-[#e0e0e0] text-base font-semibold bg-white text-black flex justify-between items-center cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {selectedOption?.color && (
            <div className="w-6 h-6 rounded-md" style={{ background: selectedOption.color }} />
          )}
          <span>{selectedOption?.label}</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e0e0e0] rounded-2xl shadow-lg z-50 max-h-[200px] overflow-y-auto no-scrollbar">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              {opt.color && (
                <div className="w-6 h-6 rounded-md" style={{ background: opt.color }} />
              )}
              <span className="font-semibold text-sm text-black">{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}