export const pad = (n) => String(n).padStart(2, '0');
export const monthKey = (y, m) => y * 12 + m;

const inRanges = (f, key) =>
  (f.ranges || []).some((r) => key >= r.from && (r.to == null || key <= r.to));

export function versionAt(f, key) {
  const vs = [...(f.versions || [])].sort((a, b) => a.from - b.from);
  let v = null;
  vs.forEach((x) => { if (x.from <= key) v = x; });
  if (!v) v = vs[0];
  return v ? { ...v, id: f.id } : null;
}

export function fixedAt(f, key) {
  if (!inRanges(f, key) || (f.skipped || []).includes(key)) return null;
  return versionAt(f, key);
}

export const existsAt = (f, key) => (f.ranges || []).some((r) => r.from <= key);

// scope: 'one' (só este mês) | 'forward' (este e os próximos)
export function deactivate(f, key, scope) {
  if (scope === 'one') return { skipped: [...new Set([...(f.skipped || []), key])] };
  const ranges = (f.ranges || []).flatMap((r) => {
    if (r.to != null && r.to < key) return [r];
    if (r.from >= key) return [];
    return [{ from: r.from, to: key - 1 }];
  });
  return { ranges, skipped: (f.skipped || []).filter((k) => k < key) };
}

export function reactivate(f, key) {
  const skipped = (f.skipped || []).filter((k) => k !== key);
  const ranges = inRanges(f, key) ? f.ranges || [] : [...(f.ranges || []), { from: key, to: null }];
  return { skipped, ranges };
}