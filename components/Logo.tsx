/** 点線の円（阿）と塗りの円（吽） */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 24" fill="none" aria-hidden="true" className={className}>
      <circle
        cx="11"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="48 9"
        transform="rotate(-20 11 12)"
      />
      <circle cx="33" cy="12" r="10" fill="currentColor" />
    </svg>
  );
}
