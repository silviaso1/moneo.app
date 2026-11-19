import { useState, useEffect } from 'react';
import FormInput from './FormInput';
import CustomSelect from './CustomSelect';

export default function InvestmentForm({ accounts, onSubmit, investmentToEdit }) {
  const [value, setValue] = useState('');
  const [day, setDay] = useState('');
  const [desc, setDesc] = useState('');
  const [bank, setBank] = useState(accounts[0]?.name || '');

  useEffect(() => {
    if (investmentToEdit) {
      setValue(investmentToEdit.value || '');
      setDay(investmentToEdit.day || '');
      setDesc(investmentToEdit.desc || '');
      setBank(investmentToEdit.bank || accounts[0]?.name || '');
    }
  }, [investmentToEdit, accounts]);

  const bankOptions = accounts.map(acc => ({
    value: acc.name,
    label: acc.name,
    color: acc.color
  }));

  const handleSubmit = () => {
    if (!value || parseFloat(value) <= 0) return alert('Insira um valor válido.');
    if (!day) return alert('Insira o dia do mês.');
    onSubmit({ value, day, bank, desc }, investmentToEdit?.id);
  };

  return (
    <div>
      <FormInput label="Valor Rendido (R$)" type="number" placeholder="0,00" value={value} onChange={(e) => setValue(e.target.value)} />
      
      {/* Input de Dia sem as setinhas nativas */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-black mb-2">Dia do Mês</label>
        <input 
          type="number" 
          placeholder="Ex: 05" 
          value={day} 
          onChange={(e) => setDay(e.target.value)} 
          className="w-full p-4 rounded-2xl border border-[#e0e0e0] text-base font-semibold outline-none bg-white text-black focus:border-black transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      
      <FormInput label="Descrição (Opcional)" placeholder="Ex: CDB 110%..." value={desc} onChange={(e) => setDesc(e.target.value)} />
      
      <CustomSelect 
        label="Onde rendeu? (Bancos cadastrados)" 
        options={bankOptions} 
        value={bank} 
        onChange={setBank} 
      />

      <button onClick={handleSubmit} className="w-full p-[18px] rounded-2xl bg-black text-white text-base font-bold mt-2.5 hover:bg-[#333] transition-colors">
        {investmentToEdit ? 'Salvar Alterações' : 'Adicionar Rendimento'}
      </button>
    </div>
  );
}