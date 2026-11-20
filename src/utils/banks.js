
export const brazilianBanks = [
  { name: 'Nubank', ispb: '18236120', color: '#820AD1' },
  { name: 'Itaú', ispb: '60701190', color: '#EC7000' },
  { name: 'Bradesco', ispb: '60746948', color: '#CC092F' },
  { name: 'Santander', ispb: '90400888', color: '#EC0000' },
  { name: 'Caixa Econômica', ispb: '00360305', color: '#00579D' },
  { name: 'Banco do Brasil', ispb: '00000000', color: '#FAE128' },
  { name: 'Inter', ispb: '00416968', color: '#FF7A00' },
  { name: 'C6 Bank', ispb: '33657248', color: '#000000' },
  { name: 'PicPay', ispb: '22896431', color: '#21C25E' },
  { name: 'Mercado Pago', ispb: '10573521', color: '#009EE3' },
  { name: 'PagBank', ispb: '01027058', color: '#00A859' },
  { name: 'Next', ispb: '00255617', color: '#00FF00' },
  { name: 'Neon', ispb: '31749533', color: '#00A0FF' },
  { name: 'Original', ispb: '00416968', color: '#00994C' }, // Exemplo, verifique o ISPB exato se necessário
  { name: 'Safra', ispb: '00517645', color: '#004B87' },
  { name: 'BTG Pactual', ispb: '30306294', color: '#002855' },
  { name: 'XP Investimentos', ispb: '33264668', color: '#000000' },
  { name: 'Sicoob', ispb: '04891850', color: '#004B87' },
  { name: 'Sicredi', ispb: '01181521', color: '#00A859' },
  { name: 'Carteira', ispb: null, color: '#8E8E93' }, 
  { name: 'Outro', ispb: null, color: '#000000' }
];

export const getBankLogoUrl = (ispb) => {
  if (!ispb) return null;
  return `https://cdn.jsdelivr.net/npm/logos-bancos-br@0/logos/svg/${ispb}.svg`;
};