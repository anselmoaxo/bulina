import Link from "next/link";

export function Capsula({ tamanho = 36 }: { tamanho?: number }) {
  return (
    <svg aria-hidden width={tamanho} height={tamanho} viewBox="0 0 512 512">
      <rect width="512" height="512" rx="112" fill="#2b3fe0" />
      <g transform="rotate(-40 256 256)">
        <rect x="96" y="176" width="320" height="160" rx="80" fill="#fff" />
        <path d="M256 176h80a80 80 0 0 1 0 160h-80z" fill="#c7cdf9" />
      </g>
    </svg>
  );
}

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex w-fit items-center gap-3 text-2xl font-extrabold ${claro ? "text-white" : "text-marca"}`}
    >
      <Capsula />
      Bulinha
    </Link>
  );
}

/** Ilustração decorativa do topo: cápsulas e um comprimido. */
export function Pilulas({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 420 420" className={className} fill="none">
      <g transform="rotate(-32 210 210)">
        <rect x="40" y="130" width="340" height="160" rx="80" fill="#fff" />
        <path d="M210 130h90a80 80 0 0 1 0 160h-90z" fill="#a5b0f5" />
        <rect x="70" y="150" width="120" height="20" rx="10" fill="#000" opacity=".06" />
      </g>
      <g transform="translate(250 270) rotate(24)">
        <rect x="-95" y="-45" width="190" height="90" rx="45" fill="#f6c945" />
        <path d="M0 -45h50a45 45 0 0 1 0 90h-50z" fill="#fff" />
      </g>
      <g transform="translate(90 320)">
        <circle r="46" fill="#2b3fe0" />
        <circle r="46" stroke="#a5b0f5" strokeWidth="6" />
        <path d="M-46 0h92" stroke="#a5b0f5" strokeWidth="6" />
      </g>
      <circle cx="355" cy="90" r="14" fill="#a5b0f5" opacity=".7" />
      <circle cx="60" cy="70" r="8" fill="#fff" opacity=".5" />
    </svg>
  );
}
