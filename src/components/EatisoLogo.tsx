/**
 * eatiso brand mark, recreated as an inline SVG so it stays crisp at any size
 * and needs no binary asset. The swirl uses the brand purple; the "iso" of the
 * wordmark uses the brand orange.
 */

const PURPLE = "#7C2D91";
const ORANGE = "#F5821F";

export function EatisoMark({
  size = 64,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="eatiso"
      className={className}
    >
      {/* Decorative splashes (top-left) */}
      <circle cx="16" cy="20" r="4.5" fill={PURPLE} />
      <circle cx="9" cy="33" r="2.6" fill={PURPLE} />
      <circle cx="24" cy="11" r="2.2" fill={PURPLE} />

      {/* The spiral "e" swirl */}
      <path
        d="M78 35
           C 92 50, 84 78, 56 84
           C 28 90, 12 66, 22 44
           C 31 24, 58 18, 72 32
           C 83 43, 80 60, 66 64
           C 54 67, 45 58, 49 49"
        stroke={PURPLE}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EatisoLogo({
  size = 56,
  className = "",
  wordmark = true,
}: {
  size?: number;
  className?: string;
  wordmark?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <EatisoMark size={size} />
      {wordmark && (
        <span
          className="text-3xl font-extrabold tracking-tight"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <span style={{ color: PURPLE }}>eat</span>
          <span style={{ color: ORANGE }}>iso</span>
        </span>
      )}
    </div>
  );
}
