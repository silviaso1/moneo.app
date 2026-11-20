export const fmtShort = (d) =>
  d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');

export const invKey = (iso, closingDay) => {
  const [y, m, d] = iso.split('-').map(Number);
  return y * 12 + (m - 1) + (d > closingDay ? 1 : 0);
};

export const currentKey = (card, now = new Date()) =>
  now.getFullYear() * 12 + now.getMonth() + (now.getDate() > (card.closingDay || 1) ? 1 : 0);

export function invoiceDates(card, key) {
  const y = Math.floor(key / 12);
  const m = key % 12;
  const cDay = card.closingDay || 1;
  const dDay = card.dueDay || 1;
  const close = new Date(y, m, Math.min(cDay, new Date(y, m + 1, 0).getDate()));
  const dueM = dDay <= cDay ? m + 1 : m;
  const due = new Date(y, dueM, Math.min(dDay, new Date(y, dueM + 1, 0).getDate()));
  return { close, due };
}

export function buildInvoice(card, txs, key) {
  const items = txs
    .filter((t) => t.cardId === card.id && t.type === 'expense' && invKey(t.date, card.closingDay || 1) === key)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const total = items.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const { close, due } = invoiceDates(card, key);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return { card, key, items, total, close, due, closed: close < today };
}