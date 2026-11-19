import { useState } from 'react';
import FormInput from './FormInput';

export default function IncomeForm({ accounts, onSubmit }) {
  const [value, setValue] = useState('');
  const [desc, setDesc] = useState('');
  const [bank, setBank] = useState(accounts[0]?.name || '');

  return (
    <div>
      <FormInput label="Valor (R$)" type="number" placeholder="0,00" value={value} onChange={(e) => setValue(e.target.value)} />
      <FormInput label="Descrição (Opcional)" placeholder="Ex: Salário, Freela..." value={desc} onChange={(e) => setDesc(e.target.value)} />
      <FormInput label="Banco / Conta">
        <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full p-4 rounded-2xl border border-border text-base font-semibold outline-none bg-card text-black focus:border-black">
          {accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
        </select>
      </FormInput>
      <button onClick={() => onSubmit({ value, desc, bank })} className="w-full p-[18px] rounded-2xl bg-black text-white text-base font-bold mt-2.5 hover:bg-[#333]">
        Adicionar Receita
      </button>
    </div>
  );
}