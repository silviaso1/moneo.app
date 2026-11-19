import { useState } from 'react';
import FormInput from './FormInput';

export default function ExpenseForm({ accounts, onSubmit }) {
  const [value, setValue] = useState('');
  const [desc, setDesc] = useState('');
  const [bank, setBank] = useState(accounts[0]?.name || '');
  const [method, setMethod] = useState('Pix');
  const [category, setCategory] = useState('Mercado');

  return (
    <div>
      <FormInput label="Valor (R$)" type="number" placeholder="0,00" value={value} onChange={(e) => setValue(e.target.value)} />
      <FormInput label="Descrição (Opcional)" placeholder="Ex: Mercado, iFood..." value={desc} onChange={(e) => setDesc(e.target.value)} />
      <FormInput label="Banco / Conta">
        <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full p-4 rounded-2xl border border-border text-base font-semibold outline-none bg-card text-black focus:border-black">
          {accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
        </select>
      </FormInput>
      <FormInput label="Método">
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-4 rounded-2xl border border-border text-base font-semibold outline-none bg-card text-black focus:border-black">
          <option value="Pix">Pix</option>
          <option value="Cartão de Crédito">Cartão de Crédito</option>
          <option value="Cartão de Débito">Cartão de Débito</option>
          <option value="Dinheiro">Dinheiro</option>
        </select>
      </FormInput>
      <FormInput label="Categoria">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 rounded-2xl border border-border text-base font-semibold outline-none bg-card text-black focus:border-black">
          <option value="Mercado">Mercado</option>
          <option value="Lazer">Lazer</option>
          <option value="Transporte">Transporte</option>
          <option value="Moradia">Moradia</option>
          <option value="Outros">Outros</option>
        </select>
      </FormInput>
      <button onClick={() => onSubmit({ value, desc, bank, method, category })} className="w-full p-[18px] rounded-2xl bg-black text-white text-base font-bold mt-2.5 hover:bg-[#333]">
        Adicionar Gasto
      </button>
    </div>
  );
}