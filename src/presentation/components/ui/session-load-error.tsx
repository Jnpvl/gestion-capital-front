"use client";

export function SessionLoadError({ onRetry }: { onRetry: () => void }) {
  return <div className="flex min-h-dvh items-center justify-center bg-brand-light p-6"><div role="alert" className="max-w-md rounded-2xl border border-brand-line bg-white p-8 text-center"><h1 className="font-display text-xl font-bold text-brand-gray">No pudimos verificar tu sesión</h1><p className="mt-3 text-sm text-brand-muted">Tu sesión se conservó. Revisa tu conexión e intenta nuevamente; si el problema continúa, contacta al administrador.</p><button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white">Reintentar</button></div></div>;
}
