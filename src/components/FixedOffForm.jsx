export default function FixedOffForm({ fixed, monthLabel, onChoose }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-500">
        Desativar <b className="text-black">{fixed?.name}</b>:
      </p>
      <button type="button" onClick={() => onChoose('one')} className="w-full bg-[#f2f2f2] rounded-2xl py-4 font-semibold">
        Só em {monthLabel}
      </button>
      <button type="button" onClick={() => onChoose('forward')} className="w-full bg-black text-white rounded-2xl py-4 font-semibold">
        Em {monthLabel} e nos próximos meses
      </button>
      <p className="text-gray-400 text-sm text-center">
        Os meses anteriores não mudam. Você pode reativar quando quiser.
      </p>
    </div>
  );
}