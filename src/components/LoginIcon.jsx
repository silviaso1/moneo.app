export default function LoginIcon() {
  return (
    <div className="w-[72px] h-[72px] bg-black rounded-[20px] flex items-center justify-center mb-6">
      <svg width="40" height="40" viewBox="0 0 100 100">
        <circle cx="50" cy="55" r="35" fill="#fff" />
        <circle cx="28" cy="25" r="12" fill="#fff" />
        <circle cx="72" cy="25" r="12" fill="#fff" />
        <path d="M 35 50 Q 40 45 45 50" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 55 50 Q 60 45 65 50" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 42 62 Q 50 68 58 62" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}