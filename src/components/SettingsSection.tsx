function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 py-10 md:grid-cols-3">
      <div>
        <h2 className="text-base font-semibold text-orange-18">{title}</h2>
        <p className="mt-1 text-sm text-orange-42">{description}</p>
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

export default SettingsSection;
