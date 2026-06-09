// TrainerUniverse brand mark: the 3D "T" letterform. The extruded sides keep the
// brand yellow-green gradient; the front face uses `currentColor` so it reads on
// both themes (near-white on the dark navbar, ink on the light navbar) without a
// badge — just set the text color on the parent.
export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="280 248 562 685"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tu-yg" x1="285.43" y1="411.03" x2="504.79" y2="411.03" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d5e4a7" />
          <stop offset="0.5" stopColor="#b7d37d" />
          <stop offset="1" stopColor="#8cb74b" />
        </linearGradient>
        <linearGradient id="tu-yg1" x1="369.14" y1="889.5" x2="563.43" y2="889.5" href="#tu-yg" />
        <linearGradient id="tu-yg2" x1="488.14" y1="649.68" x2="647.54" y2="649.68" href="#tu-yg" />
        <linearGradient id="tu-yg3" x1="572.19" y1="410.58" x2="815.5" y2="410.58" href="#tu-yg" />
        <linearGradient id="tu-yg4" x1="740.01" y1="350.54" x2="836.64" y2="350.54" href="#tu-yg" />
      </defs>
      <polygon fill="url(#tu-yg)" points="285.43 373 360.61 448.14 504.79 449.25 504.79 372.81 285.43 373" />
      <path
        fill="currentColor"
        d="M572.39,372.11l-84.26,477.86h-119.07l84.26-477.86h-167.96l21.13-119.86h454.99l-21.13,119.86h-167.96Z"
      />
      <polygon fill="url(#tu-yg1)" points="369.14 851.72 444.21 927.38 563.43 927.38 488.14 851.62 369.14 851.72" />
      <polygon fill="url(#tu-yg2)" points="488.14 850.85 572.4 373 647.54 448.14 563.43 926.36 488.14 850.85" />
      <polygon fill="url(#tu-yg3)" points="572.19 373.89 740.01 373.89 815.5 447.27 647.34 447.27 572.19 373.89" />
      <polygon fill="url(#tu-yg4)" points="740.01 372.81 761.49 253.14 836.64 328.28 815.5 447.95 740.01 372.81" />
    </svg>
  );
}
