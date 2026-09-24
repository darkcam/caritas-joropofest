"use client";

import { useBrand } from "./brand-provider";

export default function BrandFooter({ className = "" }: { className?: string }) {
  const theme = useBrand();

  return (
    <footer
      className={`border-t border-white/10 px-5 py-5 text-center font-mono text-xs leading-6 text-zinc-400 sm:text-sm ${className}`}
    >
      Creado por{" "}
      <a
        href={theme.credit.url}
        target="_blank"
        rel="noreferrer"
        className="font-black text-[var(--brand-primary)] underline underline-offset-4 transition hover:opacity-80"
      >
        {theme.credit.name}
      </a>
      , {theme.credit.message} · {theme.eventName}
    </footer>
  );
}
