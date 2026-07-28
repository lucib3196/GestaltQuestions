type ViewHeaderProps = {
  step: string;
  title: string;
  description: string;
};

export function StepLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wide text-accent-strong">
      {children}
    </span>
  );
}

export function ViewTitle({ children }: { children: string }) {
  return <h1 className="text-2xl font-semibold text-text">{children}</h1>;
}

export function ViewDescription({ children }: { children: string }) {
  return <p className="text-sm text-text-muted">{children}</p>;
}

export function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-xl font-semibold text-text">{children}</h2>;
}

export function SectionDescription({ children }: { children: string }) {
  return <p className="text-sm text-text-muted">{children}</p>;
}

export function ViewHeader({ step, title, description }: ViewHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <StepLabel>{step}</StepLabel>
        <ViewTitle>{title}</ViewTitle>
        <ViewDescription>{description}</ViewDescription>
      </div>
    </header>
  );
}
