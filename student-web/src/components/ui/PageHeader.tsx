interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-2xl">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
