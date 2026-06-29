export default function Loader({
  size = 64,
  stroke = 5,
  fullPage = false,
  inline = false,
  className = "",
}) {
  const spinner = (
    <div
      className="relative animate-spin"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <div
        className="absolute inset-0 rounded-full border-gray-200"
        style={{ borderWidth: stroke }}
      />
      <div
        className="absolute inset-0 rounded-full border-transparent border-t-[#04506B] border-r-[#04506B]"
        style={{ borderWidth: stroke }}
      />
    </div>
  );

  if (fullPage) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-white/50 ${className}`}
      >
        {spinner}
      </div>
    );
  }

  if (inline) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        {spinner}
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-white/20 rounded-lg ${className}`}
    >
      {spinner}
    </div>
  );
}
