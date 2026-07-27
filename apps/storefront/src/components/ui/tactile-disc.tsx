export function TactileDisc() {
  return (
    <span
      data-tactile-disc
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 rounded-full border border-white/25 bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.72),rgba(255,255,255,0.16)_34%,rgba(255,255,255,0.04)_68%)] opacity-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
    />
  );
}
