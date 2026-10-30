export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 64 64" width={size}>
      <rect fill="var(--bh-sun)" height="64" rx="18" width="64" />
      <path
        d="M10 40c0-3 2-5 5-5h5l5-9c1-2 4-2 5 0l2 4c2 3 5 5 9 6l9 2c3 1 5 3 5 6v2c0 1-1 2-2 2H12c-1 0-2-1-2-2z"
        fill="var(--bh-deep)"
      />
      <path d="M12 48h42" stroke="var(--bh-cobalt)" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}
