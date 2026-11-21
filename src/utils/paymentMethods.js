export const PAYMENT_METHODS = [
  { id: 'pix', label: 'Pix', on: ['expense', 'income'] },
  { id: 'debit', label: 'Débito', on: ['expense'] },
  { id: 'credit', label: 'Crédito', on: ['expense'] },
  { id: 'deposit', label: 'Depósito', on: ['expense', 'income'] },
  { id: 'transfer', label: 'Transferência', on: ['expense', 'income'] },
  { id: 'boleto', label: 'Boleto', on: ['expense'] },
  { id: 'cash', label: 'Dinheiro', on: ['expense', 'income'] },
];

export const methodsFor = (type) => PAYMENT_METHODS.filter((m) => m.on.includes(type));
export const methodLabel = (id) => PAYMENT_METHODS.find((m) => m.id === id)?.label || '';