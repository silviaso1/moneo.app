export default function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-block w-12 h-7 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={`absolute inset-0 rounded-full transition-colors ${checked ? 'bg-black' : 'bg-[#e5e5ea]'}`}>
        <span className={`absolute top-0.5 left-0.5 h-6 w-6 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </label>
  );
}