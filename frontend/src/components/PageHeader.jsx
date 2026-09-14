export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
        {description && <p className="text-sm text-ink-500 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
