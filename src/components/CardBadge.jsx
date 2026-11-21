import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { brazilianBanks, getBankLogoUrl } from '../utils/banks';

export const CARD_BRANDS = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'American Express',
  hipercard: 'Hipercard',
};

// Logo do banco (mesma fonte usada nos Ajustes). Sem banco ou sem logo: mostra o fallback.
export function BankLogo({ name, size = 24, fallback = null }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const bank = name ? brazilianBanks.find((b) => b.name === name) : null;
  const url = bank ? getBankLogoUrl(bank.ispb) : null;

  if (!url || failedUrl === url) {
    return fallback ?? <CreditCard size={Math.round(size * 0.8)} className="text-gray-400" />;
  }
  return (
    <img
      src={url}
      alt={name}
      style={{ width: size, height: size }}
      className="object-contain"
      onError={() => setFailedUrl(url)}
    />
  );
}

// Selo simples da bandeira
export function CardBrand({ brand, height = 22 }) {
  if (!brand || !CARD_BRANDS[brand]) return null;

  const box = { height, minWidth: Math.round(height * 1.5) };
  const text = { fontSize: Math.round(height * 0.42), lineHeight: 1 };
  const base = 'inline-flex items-center justify-center rounded-md px-1.5 shrink-0 font-extrabold';
  const title = CARD_BRANDS[brand];

  if (brand === 'mastercard') {
    return (
      <span title={title} style={box} className={`${base} bg-white border border-gray-200`}>
        <svg viewBox="0 0 32 20" style={{ height: height - 8 }}>
          <circle cx="11" cy="10" r="8" fill="#EB001B" />
          <circle cx="21" cy="10" r="8" fill="#F79E1B" fillOpacity="0.9" />
        </svg>
      </span>
    );
  }
  if (brand === 'visa') {
    return (
      <span title={title} style={{ ...box, ...text, color: '#1A1F71' }} className={`${base} bg-white border border-gray-200 italic tracking-tight`}>
        VISA
      </span>
    );
  }
  if (brand === 'elo') {
    return (
      <span title={title} style={{ ...box, ...text, fontSize: Math.round(height * 0.5) }} className={`${base} bg-black text-white lowercase`}>
        elo
      </span>
    );
  }
  if (brand === 'amex') {
    return (
      <span title={title} style={{ ...box, ...text, background: '#2E77BC' }} className={`${base} text-white`}>
        AMEX
      </span>
    );
  }
  return (
    <span title={title} style={{ ...box, ...text, background: '#B3131B' }} className={`${base} text-white`}>
      Hiper
    </span>
  );
}