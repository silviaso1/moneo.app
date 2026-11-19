import { useState, useMemo } from 'react';
import ChartFilter from './ChartFilter';
import BarChart from './BarChart';
import MonthBarChart from './MonthBarChart';
import Toggle from './Toggle';
import { formatCurrency } from '../utils/formatCurrency';

export default function Charts({ transactions, currentMonth, spent, income, investments, onAddInvestment }) {
  const [monthFilter, setMonthFilter] = useState(String(currentMonth));
  const [yearFilter, setYearFilter] = useState('2026');
  const [isAnnual, setIsAnnual] = useState(false); // Novo estado do Toggle

  // Filtra categorias (só gastos)
  const categories = useMemo(() => {
    const cats = {};
    if (monthFilter === String(currentMonth) && yearFilter === '2026') {
      transactions.forEach((tx) => {
        if (tx.type === 'expense') cats[tx.category] = (cats[tx.category] || 0) + tx.value;
      });
    } else {
      cats['Mercado'] = 450; cats['Lazer'] = 200; cats['Transporte'] = 150; cats['Moradia'] = 500;
    }
    return cats;
  }, [transactions, monthFilter, yearFilter, currentMonth]);

  // Filtra rendimentos pelo mês selecionado
  const filteredInvestments = useMemo(() => {
    if (monthFilter === String(currentMonth) && yearFilter === '2026') {
      return investments; // Do mês atual real
    }
    return []; // Simulação de meses anteriores
  }, [investments, monthFilter, yearFilter, currentMonth]);

  const monthlySpent = [450, 600, 200, 800, 500, 300, 700, 400, 550, 900, spent, 0];
  const monthlyIncome = [3000, 3000, 3200, 3000, 3000, 3500, 3000, 3000, 3000, 3200, income, 0];
  const monthlyInvested = [50, 45, 60, 55, 50, 48, 52, 50, 55, 60, filteredInvestments.reduce((a,b)=>a+b.value, 0), 0];

  const total = income + spent;
  const incomePercent = total === 0 ? 0 : (income / total) * 100;
  const spentPercent = total === 0 ? 0 : (spent / total) * 100;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] font-extrabold text-black">Gráficos</h1>

      {/* Cabeçalho de Filtros e Botão Anual */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-white p-2 rounded-[24px] border border-[#e0e0e0] shadow-sm">
          <div className="pl-2">
            <span className="text-sm font-semibold text-black">Visão Anual</span>
          </div>
          <Toggle checked={isAnnual} onChange={() => setIsAnnual(!isAnnual)} />
        </div>

        {!isAnnual ? (
          <ChartFilter month={monthFilter} year={yearFilter} onMonthChange={setMonthFilter} onYearChange={setYearFilter} />
        ) : (
          <div className="flex justify-end mb-2">
            <div className="flex items-center bg-white rounded-[20px] px-4 py-2 text-sm font-bold border border-[#e0e0e0] shadow-sm">
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="bg-transparent border-none text-sm font-bold outline-none cursor-pointer">
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Entradas vs Saídas (Mensal) */}
      {!isAnnual && (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
          <h3 className="text-base font-bold mb-5 text-black">Entradas vs Saídas ({monthFilter})</h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#34c759]">Receitas (+)</span>
            <span className="text-sm font-bold text-black">R$ {formatCurrency(income)}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-[#34c759] rounded-full" style={{ width: `${incomePercent}%` }}></div>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#ff3b30]">Despesas (-)</span>
            <span className="text-sm font-bold text-black">R$ {formatCurrency(spent)}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#ff3b30] rounded-full" style={{ width: `${spentPercent}%` }}></div>
          </div>
          <div className="mt-6 pt-4 border-t border-[#e0e0e0] flex justify-between items-center">
            <span className="text-sm font-bold text-black">Saldo do mês:</span>
            <span className={`text-base font-extrabold ${income - spent >= 0 ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
              {income - spent > 0 ? '+' : ''} R$ {formatCurrency(Math.abs(income - spent))}
            </span>
          </div>
        </div>
      )}

      {/* Gastos por Categoria (Mensal) */}
      {!isAnnual && (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
          <h3 className="text-base font-bold mb-5 text-black">Gastos por Categoria ({monthFilter})</h3>
          {Object.keys(categories).length === 0 ? (
            <p className="text-[#8e8e93] w-full text-center">Sem gastos para exibir.</p>
          ) : (
            <BarChart
              data={Object.keys(categories).map((cat) => ({ value: categories[cat], label: cat }))}
              colorFn={(d) => (d.label === 'Mercado' ? '#ff6b00' : '#000')}
              height={200}
            />
          )}
        </div>
      )}

      {/* Rendimentos (Mensal) - Movido da tela de Juros */}
      {!isAnnual && (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
          <div className="flex justify-between items-center mb-5">
             <h3 className="text-base font-bold text-black">Rendimentos ({monthFilter})</h3>
             <button onClick={onAddInvestment} className="text-sm font-bold text-[#34c759]">+ Add</button>
          </div>
          {filteredInvestments.length === 0 ? (
            <p className="text-[#8e8e93] text-center text-sm">Sem dados para exibir.</p>
          ) : (
            <BarChart
              data={filteredInvestments.map((i) => ({ value: i.value, label: `Dia ${i.day}` }))}
              colorFn={() => '#34c759'}
              height={200}
            />
          )}
        </div>
      )}

      {/* Evolução Anual */}
      {isAnnual && (
        <>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
            <h3 className="text-base font-bold mb-5 text-black">Evolução de Gastos</h3>
            <MonthBarChart values={monthlySpent} activeIndex={parseInt(monthFilter)} />
          </div>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
            <h3 className="text-base font-bold mb-5 text-black">Evolução de Receitas</h3>
            <MonthBarChart values={monthlyIncome} activeIndex={parseInt(monthFilter)} color="#34c759" />
          </div>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
            <h3 className="text-base font-bold mb-5 text-black">Evolução de Juros</h3>
            <MonthBarChart values={monthlyInvested} activeIndex={parseInt(monthFilter)} color="#ff6b00" />
          </div>
        </>
      )}
    </div>
  );
}