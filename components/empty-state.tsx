export default function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-maize-50 text-navy">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-bold text-navy">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
