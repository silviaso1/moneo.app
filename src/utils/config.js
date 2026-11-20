export const SHORTCUTS = {
  investment: 'Juros',
  fixeds: 'Fixos',
  limits: 'Limites',
  invoices: 'Faturas',
  expense: 'Gasto',
  income: 'Receita',
  statement: 'Transações',
  investments: 'Juros',
  planejar: 'Planejar',
  graphs: 'Gráficos',
  family: 'Família',
  settings: 'Ajustes',
};
export const DEFAULT_SHORTCUTS = ['investment', 'fixeds', 'limits', 'invoices'];

export const NAV = {
  dashboard: 'Início',
  statement: 'Transações',
  charts: 'Planejar',
  graphs: 'Gráficos',
  invoices: 'Faturas',
  investments: 'Juros',
  family: 'Família',
  settings: 'Ajustes',
};
export const DEFAULT_NAV = ['dashboard', 'statement', 'graphs', 'settings'];

export const THEME_COLORS = [
  { id: 'purple', name: 'Roxo',     from: '#C4B5FD', to: '#8B5CF6' },
  { id: 'pink',   name: 'Rosa',     from: '#FBCFE8', to: '#EC4899' },
  { id: 'blue',   name: 'Azul',     from: '#BFDBFE', to: '#3B82F6' },
  { id: 'green',  name: 'Verde',    from: '#BBF7D0', to: '#22C55E' },
  { id: 'yellow', name: 'Amarelo',  from: '#FEF08A', to: '#EAB308' },
  { id: 'orange', name: 'Laranja',  from: '#FED7AA', to: '#F97316' },
  { id: 'teal',   name: 'Turquesa', from: '#99F6E4', to: '#14B8A6' },
];

export const safeTheme = (id) =>
  THEME_COLORS.some((t) => t.id === id) ? id : 'purple';

export const safeNav = (list) => {
  if (!Array.isArray(list) || list.length === 0) return DEFAULT_NAV;
  const valid = list.filter((id) => NAV[id]);
  return valid.length ? valid : DEFAULT_NAV;
};

export const safeShortcuts = (list) => {
  if (!Array.isArray(list) || list.length === 0) return DEFAULT_SHORTCUTS;
  const valid = list.filter((id) => SHORTCUTS[id]);
  return valid.length ? valid : DEFAULT_SHORTCUTS;
};