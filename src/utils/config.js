export const SHORTCUTS = {
  investment: 'Juros',
  fixeds: 'Fixos',
  limits: 'Limites',
  invoices: 'Faturas',
  expense: 'Gasto',
  income: 'Receita',
  statement: 'Transações',
  investments: 'Guardado',
  planejar: 'Planejar',
  settings: 'Ajustes',
};
export const DEFAULT_SHORTCUTS = ['investment', 'fixeds', 'limits', 'invoices'];

export const NAV = {
  dashboard: 'Início',
  statement: 'Transações',
  charts: 'Planejar',
  invoices: 'Faturas',
  investments: 'Guardado',
  settings: 'Ajustes',
};
export const DEFAULT_NAV = ['dashboard', 'statement', 'charts', 'settings'];

export const safeShortcuts = (l) => {
  const ok = Array.isArray(l) ? l.filter((id, i) => SHORTCUTS[id] && l.indexOf(id) === i) : [];
  return ok.length ? ok : DEFAULT_SHORTCUTS;
};

export const safeNav = (l) =>
  Array.isArray(l) && l.length === 4 && new Set(l).size === 4 && l.every((id) => NAV[id]) ? l : DEFAULT_NAV;