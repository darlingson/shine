import { useId } from "react";

export function LogoMark({ className = "size-7" }: { className?: string }) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M16 1c1.7 8.8 6.2 13.3 15 15-8.8 1.7-13.3 6.2-15 15-1.7-8.8-6.2-13.3-15-15 8.8-1.7 13.3-6.2 15-15z"
      />
      <path fill="#14532D" d="M16 11.2l4.6 3.3-1.8 5.4h-5.6l-1.8-5.4z" />
      <path
        fill={`url(#${gradientId})`}
        d="M26 3c.5 2.6 1.9 4 4.5 4.5-2.6.5-4 1.9-4.5 4.5-.5-2.6-1.9-4-4.5-4.5 2.6-.5 4-1.9 4.5-4.5z"
      />
    </svg>
  );
}
