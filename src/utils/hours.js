export function formatHours(h) {
  const totalMin = Math.round((Number(h) || 0) * 60);
  if (totalMin <= 0) return '0 min';
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  if (hh === 0) return `${mm} min`;
  if (mm === 0) return `${hh}h`;
  return `${hh}h ${mm}min`;
}