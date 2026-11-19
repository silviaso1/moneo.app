import { useState, useMemo } from 'react';
import ChartFilter from './ChartFilter';
import InvestmentHistory from './InvestmentHistory';
import { formatCurrency } from '../utils/formatCurrency';

export default function Investments({ investments, hideSaved, totalSaved, currentMonth, onAdd, onDelete, onEdit }) {
  const [monthFilter, setMonthFilter] = useState(String(currentMonth));
  const [yearFilter, setYearFilter] = useState('2026');

  const filtered = useMemo(() => {
    if (monthFilter !== String(currentMonth) || yearFilter !== '2026') {
      return []; 
    }
    return investments;
  }, [investments, monthFilter, yearFilter, currentMonth]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] font-extrabold text-black">Juros e Rendimentos</h1>

      <ChartFilter month={monthFilter} year={yearFilter} onMonthChange={setMonthFilter} onYearChange={setYearFilter} />

      <div className="bg-black text-white rounded-[24px] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-[#aaa]">Total Guardado (Todas as contas)</span>
        </div>
        <div className="text-[36px] font-extrabold tracking-tight flex items-baseline gap-1">
          <span className="text-lg font-semibold text-[#aaa]">R$</span>
          <span>{hideSaved ? '••••••' : formatCurrency(totalSaved)}</span>
        </div>
        <p className="text-[#aaa] text-[13px] mt-2">Este valor conta como saldo no Dashboard, mas não como receita.</p>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
        <h3 className="text-base font-bold mb-5 text-black">Histórico de Rendimentos</h3>
        <InvestmentHistory items={filtered} onDelete={onDelete} onEdit={onEdit} />
        <button onClick={onAdd} className="w-full p-[18px] rounded-2xl bg-black text-white text-base font-bold mt-4 hover:bg-[#333]">
          Adicionar Rendimento
        </button>
      </div>
    </div>
  );
}