export default function StatusBadge({ state }) {
  const config = state === 'angry'
    ? { bg: '#ffe5e5', color: '#ff3b30', text: 'Fora do Limite', icon: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> }
    : state === 'sad'
    ? { bg: '#fff3e0', color: '#ff6b00', text: 'Cuidado', icon: <><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></> }
    : { bg: '#f0f0f0', color: '#000', text: 'No ritmo', icon: <polyline points="20 6 9 17 4 12" /> };

  return (
    <div className="inline-flex items-center px-4 py-2 rounded-[20px] text-sm font-semibold mt-4" style={{ backgroundColor: config.bg, color: config.color }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
        {config.icon}
      </svg>
      {config.text}
    </div>
  );
}