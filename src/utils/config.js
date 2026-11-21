export const SHORTCUTS = {
  investment: 'Rendimento',
  fixeds: 'Fixos',
  limits: 'Limites',
  invoices: 'Faturas',
  expense: 'Gasto',
  income: 'Receita',
  statement: 'Transações',
  investments: 'Investimentos',
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
  investments: 'Investimentos',
  family: 'Família',
  settings: 'Ajustes',
};
export const DEFAULT_NAV = ['dashboard', 'statement', 'graphs', 'settings'];
export const THEME_COLORS = {
  purple: { name: 'Roxo', from: '#C4B5FD', to: '#8B5CF6', soft: '#EDE9FE', text: '#7C3AED', rgb: '139, 92, 246', softRgb: '237, 233, 254' },
  pink: { name: 'Rosa', from: '#FBCFE8', to: '#EC4899', soft: '#FCE7F3', text: '#DB2777', rgb: '236, 72, 153', softRgb: '252, 231, 243' },
  blue: { name: 'Azul', from: '#BFDBFE', to: '#3B82F6', soft: '#DBEAFE', text: '#2563EB', rgb: '59, 130, 246', softRgb: '219, 234, 254' },
  green: { name: 'Verde', from: '#BBF7D0', to: '#22C55E', soft: '#DCFCE7', text: '#16A34A', rgb: '34, 197, 94', softRgb: '220, 252, 231' },
  yellow: { name: 'Amarelo', from: '#FEF08A', to: '#EAB308', soft: '#FEF9C3', text: '#CA8A04', rgb: '234, 179, 8', softRgb: '254, 249, 195' },
  orange: { name: 'Laranja', from: '#FED7AA', to: '#F97316', soft: '#FFEDD5', text: '#EA580C', rgb: '249, 115, 22', softRgb: '255, 237, 213' },
  teal: { name: 'Turquesa', from: '#99F6E4', to: '#14B8A6', soft: '#CCFBF1', text: '#0D9488', rgb: '20, 184, 166', softRgb: '204, 251, 241' },
};

export const safeTheme = (id) => (THEME_COLORS[id] ? id : 'purple');
export const safeNav = (list) => (list && list.length >= 4 ? list : DEFAULT_NAV);
export const safeShortcuts = (list) => (list && list.length > 0 ? list : DEFAULT_SHORTCUTS);