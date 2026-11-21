export const INVESTMENT_GROUPS = [
  'Renda fixa pós-fixada',
  'Renda fixa prefixada e híbrida',
  'Crédito privado',
  'Renda variável',
  'Fundos',
  'Previdência',
  'Alternativos',
];

export const INVESTMENT_TYPES = [
  { id: 'poupanca', label: 'Poupança', group: 'Renda fixa pós-fixada' },
  { id: 'cdb', label: 'CDB', group: 'Renda fixa pós-fixada' },
  { id: 'cdb-cdi', label: 'CDB (% do CDI)', group: 'Renda fixa pós-fixada' },
  { id: 'cdi', label: 'CDI / Conta remunerada', group: 'Renda fixa pós-fixada' },
  { id: 'rdb', label: 'RDB', group: 'Renda fixa pós-fixada' },
  { id: 'caixinha', label: 'Caixinha / Cofrinho', group: 'Renda fixa pós-fixada' },
  { id: 'tesouro-selic', label: 'Tesouro Selic', group: 'Renda fixa pós-fixada' },
  { id: 'lci', label: 'LCI', group: 'Renda fixa pós-fixada' },
  { id: 'lca', label: 'LCA', group: 'Renda fixa pós-fixada' },
  { id: 'lc', label: 'LC (Letra de Câmbio)', group: 'Renda fixa pós-fixada' },

  { id: 'cdb-pre', label: 'CDB prefixado', group: 'Renda fixa prefixada e híbrida' },
  { id: 'tesouro-pre', label: 'Tesouro Prefixado', group: 'Renda fixa prefixada e híbrida' },
  { id: 'tesouro-ipca', label: 'Tesouro IPCA+', group: 'Renda fixa prefixada e híbrida' },
  { id: 'cdb-ipca', label: 'CDB IPCA+', group: 'Renda fixa prefixada e híbrida' },

  { id: 'debenture', label: 'Debêntures', group: 'Crédito privado' },
  { id: 'cri', label: 'CRI', group: 'Crédito privado' },
  { id: 'cra', label: 'CRA', group: 'Crédito privado' },

  { id: 'acoes', label: 'Ações', group: 'Renda variável' },
  { id: 'fii', label: 'Fundos imobiliários (FII)', group: 'Renda variável' },
  { id: 'etf', label: 'ETF', group: 'Renda variável' },
  { id: 'bdr', label: 'BDR', group: 'Renda variável' },
  { id: 'internacional', label: 'Exterior (stocks/REITs)', group: 'Renda variável' },

  { id: 'fundo-di', label: 'Fundo DI / Renda fixa', group: 'Fundos' },
  { id: 'fundo-multi', label: 'Fundo multimercado', group: 'Fundos' },
  { id: 'fundo-acoes', label: 'Fundo de ações', group: 'Fundos' },

  { id: 'pgbl', label: 'PGBL', group: 'Previdência' },
  { id: 'vgbl', label: 'VGBL', group: 'Previdência' },

  { id: 'cripto', label: 'Criptomoedas', group: 'Alternativos' },
  { id: 'ouro', label: 'Ouro', group: 'Alternativos' },
  { id: 'cambio', label: 'Dólar / Câmbio', group: 'Alternativos' },
  { id: 'coe', label: 'COE', group: 'Alternativos' },
  { id: 'outros', label: 'Outros', group: 'Alternativos' },
];

export const DEFAULT_INV_TYPES = ['poupanca', 'cdb', 'cdi', 'tesouro-selic', 'acoes', 'fii', 'outros'];


export const enabledInvTypes = (ids) => {
  const list = Array.isArray(ids) && ids.length ? ids : DEFAULT_INV_TYPES;
  return INVESTMENT_TYPES.filter((t) => list.includes(t.id));
};

export const kindLabel = (id) => INVESTMENT_TYPES.find((t) => t.id === id)?.label || '';