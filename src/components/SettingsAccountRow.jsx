export default function SettingsAccountRow({ acc, isLast, onMove, onDelete, onEdit }) {
  return (
    <div className={`flex justify-between items-center py-3 ${isLast ? '' : 'border-b border-[#e0e0e0]'}`}>
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm text-white shrink-0" 
          style={{ background: acc.color || '#000' }}
        >
          {acc.name ? acc.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-black leading-tight">{acc.name}</span>
          <span className="text-xs text-[#8e8e93]">
            {acc.type || 'Conta Corrente'} {acc.desc ? `· ${acc.desc}` : ''}
          </span>
        </div>
      </div>
      
      <div className="flex gap-1 items-center">
        {/* Botão de Editar (Lápis) */}
        <button onClick={onEdit} className="p-2 rounded-lg text-[#8e8e93] hover:bg-[#f0f0f0] hover:text-black transition-colors" title="Editar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        
        {/* Botão de Mover para Cima */}
        <button onClick={() => onMove(-1)} className="p-2 rounded-lg text-[#8e8e93] hover:bg-[#f0f0f0] hover:text-black transition-colors" title="Mover para cima">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        
        {/* Botão de Mover para Baixo */}
        <button onClick={() => onMove(1)} className="p-2 rounded-lg text-[#8e8e93] hover:bg-[#f0f0f0] hover:text-black transition-colors" title="Mover para baixo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        
        {/* Botão de Excluir (Lixeira) */}
        <button onClick={onDelete} className="p-2 rounded-lg text-[#8e8e93] hover:bg-[#ffe5e5] hover:text-[#ff3b30] transition-colors" title="Excluir conta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}