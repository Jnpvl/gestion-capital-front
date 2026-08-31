interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: AdminPaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-brand-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-brand-muted">
        Mostrando {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-brand-line px-3 py-2 text-sm font-medium text-brand-gray disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="px-2 text-sm text-brand-muted">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-brand-line px-3 py-2 text-sm font-medium text-brand-gray disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
