export default function BarChart({ data, max, colorFn, labelFn, height = 200 }) {
  const maxVal = max || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 mt-5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <div className="w-full rounded-t-lg transition-all" style={{ height: `${(d.value / maxVal) * 100}%`, background: colorFn ? colorFn(d, i) : '#000' }} />
          <span className="text-xs font-semibold text-muted">{labelFn ? labelFn(d, i) : d.label}</span>
        </div>
      ))}
    </div>
  );
}