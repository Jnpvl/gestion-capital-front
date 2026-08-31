import { courseStructurePreview } from "@/shared/config/admin-nav";

export function CourseStructureDiagram() {
  return (
    <div className="rounded-2xl border border-brand-line bg-white p-6 sm:p-8">
      <h2 className="font-display text-lg font-bold text-brand-gray">
        {courseStructurePreview.title}
      </h2>
      <div className="mt-6 space-y-4">
        {courseStructurePreview.levels.map((level, index) => (
          <div key={level.title} className="relative flex gap-4">
            {index < courseStructurePreview.levels.length - 1 && (
              <span
                className="absolute left-[15px] top-10 h-[calc(100%+8px)] w-px bg-brand-line"
                aria-hidden="true"
              />
            )}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-brand-line bg-brand-light p-4">
              <h3 className="font-display font-bold text-brand-gray">{level.title}</h3>
              <p className="mt-1 text-sm text-brand-muted">{level.description}</p>
              {"items" in level && level.items && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {level.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-brand-line bg-white px-2.5 py-1 text-xs font-medium text-brand-gray"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
