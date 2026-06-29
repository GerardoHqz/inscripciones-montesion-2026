export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-0.5 w-4 rounded bg-primary" />
      <h3 className="text-xs font-bold uppercase tracking-widest text-primary">{children}</h3>
      <div className="h-0.5 flex-1 rounded bg-border" />
    </div>
  );
}
