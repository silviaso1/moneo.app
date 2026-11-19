import Toggle from './Toggle';
import LimitControl from './LimitControl';
import SettingsAccountRow from './SettingsAccountRow';

export default function Settings({ state, onAddAccount, onDeleteAccount, onMoveAccount, onLimitChange, onToggleFollow, onToggleSaved, onLogout, onEditAccount }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] font-extrabold text-black">Ajustes</h1>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
        <h3 className="text-base font-bold mb-4 text-black">Contas Bancárias</h3>
        {state.accounts.map((acc, idx) => (
          <SettingsAccountRow
            key={acc.id}
            acc={acc}
            isLast={idx === state.accounts.length - 1}
            onMove={(dir) => onMoveAccount(acc.id, dir)}
            onDelete={() => onDeleteAccount(acc.id)}
            onEdit={() => onEditAccount(acc)}
          />
        ))}
        <button onClick={onAddAccount} className="w-full p-[18px] rounded-2xl bg-[#f0f0f0] text-black text-base font-bold mt-4">
          Adicionar Conta
        </button>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
        <div className="flex flex-col items-start gap-3 py-4 border-b border-[#e0e0e0]">
          <span className="text-[15px] font-medium text-black">Limite de Gasto Mensal</span>
          <LimitControl value={state.limit} onChange={onLimitChange} />
        </div>
        <div className="flex justify-between items-center py-4 border-b border-[#e0e0e0]">
          <span className="text-[15px] font-medium text-black">Seguir o cursor</span>
          <Toggle checked={state.followCursor} onChange={onToggleFollow} />
        </div>
        <div className="flex justify-between items-center py-4">
          <span className="text-[15px] font-medium text-black">Ocultar saldo guardado</span>
          <Toggle checked={state.hideSaved} onChange={onToggleSaved} />
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
        <h3 className="text-base font-bold mb-2.5 text-black">Sobre</h3>
        <p className="text-[#8e8e93] text-sm">Versão 1.0.0 - Skunk App</p>
        <button onClick={onLogout} className="w-full p-[18px] rounded-2xl bg-[#ff3b30] text-white text-base font-bold mt-5">
          Sair da Conta
        </button>
      </div>
    </div>
  );
}