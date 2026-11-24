export function CollectionDetailLoading() {
  return (
    <section className="min-h-[560px] rounded-lg border border-border bg-surface p-6 text-text shadow-soft">
      <div className="flex min-h-96 items-center justify-center rounded-md border border-dashed border-border bg-bg text-sm font-medium text-text-muted">
        Loading collection...
      </div>
    </section>
  );
}

export function CollectionDetailError({ message }: { message: string }) {
  return (
    <section className="rounded-lg border border-warning-border bg-warning-muted p-6 text-warning shadow-soft">
      <h1 className="text-lg font-semibold">Unable to load collection</h1>
      <p className="mt-2 text-sm">{message}</p>
    </section>
  );
}

export function CollectionDetailEmpty() {
  return (
    <section className="rounded-lg border border-border bg-surface p-6 text-text shadow-soft">
      <div className="flex min-h-72 items-center justify-center rounded-md border border-dashed border-border bg-bg text-sm font-medium text-text-muted">
        Select a collection to view its details.
      </div>
    </section>
  );
}
