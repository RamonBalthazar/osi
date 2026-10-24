import { useId } from "react";

// National Rail double arrow from Wikimedia Commons ("National_Rail_logo.svg"), centred in a
// square so it lines up with the roundels instead of running wide.
export function NationalRailLogo({ className }: { className?: string }) {
  const clipId = useId();
  return (
    <svg viewBox="0 -11.5 62 62" className={className} role="img" aria-label="National Rail">
      <title>National Rail</title>
      <clipPath id={clipId}>
        <rect width="62" height="39" />
      </clipPath>
      <g stroke="#ED1C24" fill="none" clipPath={`url(#${clipId})`}>
        <path d="M1,-8.9 46,12.4 16,26.6 61,47.9" strokeWidth="6" />
        <path d="M0,12.4H62m0,14.2H0" strokeWidth="6.4" />
      </g>
    </svg>
  );
}
