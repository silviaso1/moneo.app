import MonthSelector from './MonthSelector';
import CircleProgress from './CircleProgress';
import Mascot from './Mascot';
import StatusBadge from './StatusBadge';
import SpeechBubble from './SpeechBubble';
import BalanceCard from './BalanceCard';
import QuickActions from './QuickActions';
import { formatCurrency } from '../utils/formatCurrency';

export default function Dashboard({
  state, percent, remaining, totalAvailable, mascotState, totalBalance,
  onChangeMonth, onToggleBalance, onToggleShowAll, onOpenModal, onTab,
}) {
  // Separa os reais dos centavos para manter o estilo do layout
  const remainingFormatted = formatCurrency(remaining).split(',');
  const totalAvailableFormatted = formatCurrency(totalAvailable).split(',');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mt-4">
        <MonthSelector currentMonth={state.currentMonth} onChange={onChangeMonth} />
        <button onClick={() => onTab('settings')} className="w-10 h-10 rounded-full bg-white border border-[#e0e0e0] flex justify-center items-center shadow-sm text-black">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="relative flex flex-col items-center my-5 w-[260px] h-[260px] mx-auto">
          <CircleProgress percent={percent} />
          <Mascot state={mascotState} followCursor={state.followCursor} />
        </div>

        <div className="text-center">
          <p className="text-[15px] text-[#8e8e93] mb-2 font-medium">Pode gastar</p>
          <h1 className="text-[52px] font-extrabold tracking-[-2px] leading-none text-black">
            R$ {remainingFormatted[0]}<span className="text-[28px]">,{remainingFormatted[1]}</span>
          </h1>
          <div className="text-sm text-[#8e8e93] mt-2 font-medium">de R$ {totalAvailableFormatted[0]} · 15 dias</div>
          <StatusBadge state={mascotState} />
        </div>

        <SpeechBubble state={mascotState} />

        <BalanceCard
          accounts={state.accounts}
          totalBalance={totalBalance}
          hidden={state.hideTotalBalance}
          showAll={state.showAllAccounts}
          onToggleVisibility={onToggleBalance}
          onToggleShowAll={onToggleShowAll}
        />

        <QuickActions onOpenModal={onOpenModal} onTab={onTab} />

        <button onClick={() => onTab('statement')} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-[#e0e0e0] active:bg-gray-50 text-black">
          <div className="flex items-center gap-3 text-[15px] font-semibold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Ver Extrato Completo
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
}