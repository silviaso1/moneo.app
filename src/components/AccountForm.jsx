import { useState, useEffect } from 'react';
import FormInput from './FormInput';
import CustomSelect from './CustomSelect';
import { brazilianBanks, getBankLogoUrl } from '../utils/banks';

export default function AccountForm({ onSubmit, accountToEdit }) {
  const [name, setName] = useState(brazilianBanks[0].name);
  const [balance, setBalance] = useState('');
  const [type, setType] = useState('Conta Corrente');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name || brazilianBanks[0].name);
      setBalance(accountToEdit.balance || '');
      setType(accountToEdit.type || 'Conta Corrente');
      setDesc(accountToEdit.desc || '');
    }
  }, [accountToEdit]);

  const selectedBank = brazilianBanks.find(b => b.name === name) || brazilianBanks[0];
  const color = selectedBank.color;
  const logoUrl = getBankLogoUrl(selectedBank.ispb);

  const bankOptions = brazilianBanks.map(bank => ({
    value: bank.name,
    label: bank.name,
    color: bank.color
  }));

  const typeOptions = [
    { value: 'Conta Corrente', label: 'Conta Corrente' },
    { value: 'Poupança', label: 'Poupança' },
    { value: 'Carteira', label: 'Carteira (Dinheiro)' },
    { value: 'Investimento', label: 'Investimento' },
    { value: 'Outro', label: 'Outro' },
  ];

  const handleSubmit = () => {
    if (!name) {
      alert('Selecione um banco.');
      return;
    }
    onSubmit({ name, balance, color, type, desc }, accountToEdit?.id);
  };

  return (
    <div>
      <CustomSelect 
        label="Banco / Instituição" 
        options={bankOptions} 
        value={name} 
        onChange={setName} 
      />

      <CustomSelect 
        label="Tipo de Conta" 
        options={typeOptions} 
        value={type} 
        onChange={setType} 
      />

      <FormInput 
        label="Saldo Atual (R$)" 
        type="number" 
        placeholder="0,00" 
        value={balance} 
        onChange={(e) => setBalance(e.target.value)} 
      />

      <FormInput 
        label="Descrição (Opcional)" 
        placeholder="Ex: Conta do dia a dia" 
        value={desc} 
        onChange={(e) => setDesc(e.target.value)} 
      />
      
      {/* PRÉVIA DA CONTA COM LOGO REAL */}
      <div className="mb-6 flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-[#e0e0e0]">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg text-white overflow-hidden shrink-0"
          style={{ background: logoUrl ? '#ffffff' : color }} // Fundo branco se tiver logo, senão usa a cor
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={name} 
              className="w-7 h-7 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          {/* Fallback: Bolinha/Letra caso a logo falhe ou não exista */}
          <span 
            className={`${logoUrl ? 'hidden' : 'block'}`}
            style={{ color: logoUrl ? 'transparent' : '#fff' }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-black">Prévia da conta</p>
          <p className="text-xs text-[#8e8e93]">{type} · A cor será aplicada automaticamente</p>
        </div>
      </div>

      <button 
        onClick={handleSubmit} 
        className="w-full p-[18px] rounded-2xl bg-black text-white text-base font-bold mt-2 hover:bg-[#333] transition-colors"
      >
        {accountToEdit ? 'Salvar Alterações' : 'Adicionar Conta'}
      </button>
    </div>
  );
}