export default function CircleProgress({ percent }) {
  const circumference = 2 * Math.PI * 120;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent > 90 ? '#ff3b30' : percent > 70 ? '#ff6b00' : '#000000';

  return (
    <svg className="w-[260px] h-[260px]" viewBox="0 0 260 260">
      <circle className="fill-none stroke-[#e5e5ea] stroke-8" cx="130" cy="130" r="120" />
      <circle
        className="fill-none stroke-8 [stroke-linecap:round] -rotate-90 origin-center transition-[stroke-dashoffset] duration-1000 ease-out"
        cx="130" cy="130" r="120"
        style={{ strokeDasharray: circumference, strokeDashoffset: offset, stroke: color }}
      />
    </svg>
  );
}