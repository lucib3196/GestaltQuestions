import { Link } from "react-router-dom";

export function CollectionNavigation({ title }: { title: string }) {
  <nav className="flex min-w-0 items-center gap-2 text-sm font-semibold">
    <Link
      to="/question_builder/collections"
      className="text-slate-500 transition hover:text-slate-300"
    >
      Collections
    </Link>
    <span className="text-slate-700">/</span>
    <span className="min-w-0 truncate text-slate-100">{title}</span>
  </nav>;
}
