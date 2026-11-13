export function EmployeeRecordNumber({ id }: { id: string }) {
  return (
    <p className="mt-0.5 max-w-56 truncate select-all font-mono text-[10px] font-normal leading-tight text-brand-muted" title={id} aria-label={`Expediente ${id}`}>
      {id}
    </p>
  );
}
