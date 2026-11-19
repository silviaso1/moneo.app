import TransactionItem from './TransactionItem';

export default function Statement({ transactions }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] font-extrabold text-black">Extrato</h1>
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
        <h3 className="mb-4 text-base font-bold text-black">Transações</h3>
        {transactions.length === 0 ? (
          <p className="text-[#8e8e93] text-center py-5">Nenhuma transação.</p>
        ) : (
          [...transactions].reverse().map((tx, i) => <TransactionItem key={i} tx={tx} />)
        )}
      </div>
    </div>
  );
}