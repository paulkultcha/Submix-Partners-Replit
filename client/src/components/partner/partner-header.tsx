interface PartnerHeaderProps {
  title: string;
  subtitle: string;
}

export function PartnerHeader({ title, subtitle }: PartnerHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}