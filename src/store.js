export const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const mascots = {
  normal: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="55" r="35" fill="#1a1a1a"/><circle cx="28" cy="25" r="12" fill="#1a1a1a"/><circle cx="72" cy="25" r="12" fill="#1a1a1a"/><path d="M 32 55 Q 40 55 40 55" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M 60 55 Q 68 55 68 55" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  happy: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="55" r="35" fill="#1a1a1a"/><circle cx="28" cy="25" r="12" fill="#1a1a1a"/><circle cx="72" cy="25" r="12" fill="#1a1a1a"/><path d="M 35 50 Q 40 45 45 50" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 55 50 Q 60 45 65 50" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 42 62 Q 50 68 58 62" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  sad: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="55" r="35" fill="#1a1a1a"/><circle cx="28" cy="25" r="12" fill="#1a1a1a"/><circle cx="72" cy="25" r="12" fill="#1a1a1a"/><path d="M 35 50 Q 40 45 45 50" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 55 50 Q 60 45 65 50" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 42 55 Q 42 62 42 62 Q 42 64 40 64 Q 38 64 38 62 Q 38 62 38 55 Z" fill="#fff"/></svg>`,
  angry: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="55" r="35" fill="#1a1a1a"/><circle cx="28" cy="25" r="12" fill="#1a1a1a"/><circle cx="72" cy="25" r="12" fill="#1a1a1a"/><line x1="30" y1="48" x2="45" y2="52" stroke="#fff" stroke-width="4" stroke-linecap="round"/><line x1="70" y1="48" x2="55" y2="52" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
};

export const speechBubbles = {
  normal: 'Mês novo, limite cheio. Respira antes de abrir o iFood.',
  happy: 'Boa! Tá sobrando dinheiro. O Skunk aprova.',
  sad: 'Estourou o limite... Vou fingir que não vi. Mentira, vi sim.',
  angry: 'Mercado ESTOUROU. Eu avisei. Tá, não avisei, mas pensei.',
};

export const initialState = {
  currentMonth: 10,
  limit: 984,
  spent: 0,
  income: 0,
  transactions: [],
  investments: [],
  accounts: [
    { id: 1, name: 'Nubank', balance: 2450.0, color: '#8A05BE' },
    { id: 2, name: 'Itaú', balance: 1200.5, color: '#EC7000' },
    { id: 3, name: 'Carteira', balance: 150.0, color: '#000000' },
    { id: 4, name: 'Inter', balance: 500.0, color: '#FF7A00' },
  ],
  followCursor: true,
  hideSaved: false,
  hideTotalBalance: false,
  showAllAccounts: false,
};
export const defaultCategories = [
  { id: 'mercado', name: 'Mercado e alimentação', icon: 'ShoppingCart', limit: 400, order: 0 },
  { id: 'restaurantes', name: 'Restaurantes e delivery', icon: 'Utensils', limit: 200, order: 1 },
  { id: 'transporte', name: 'Transporte', icon: 'Car', limit: 200, order: 2 },
  { id: 'lazer', name: 'Lazer, compras e pessoal', icon: 'PartyPopper', limit: 100, order: 3 },
  { id: 'saude', name: 'Saúde e imprevistos', icon: 'HeartPulse', limit: 84.06, order: 4 },
];