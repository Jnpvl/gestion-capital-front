export function SessionExpiredNotice({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <p role="status" className="mb-5 rounded-xl border border-brand-line bg-brand-light px-4 py-3 text-sm text-brand-gray">Tu sesión venció o ya no es válida. Inicia sesión nuevamente.</p>;
}
