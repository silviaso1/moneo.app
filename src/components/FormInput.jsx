export default function FormInput({ label, children, ...props }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-black mb-2">{label}</label>
      {children ? (
        children
      ) : (
        <input
          {...props}
          className="w-full p-4 rounded-2xl border border-[#e0e0e0] text-base font-semibold outline-none bg-white text-black focus:border-black transition-colors"
        />
      )}
    </div>
  );
}