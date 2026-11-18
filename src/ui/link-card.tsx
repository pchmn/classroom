import { Link } from "@tanstack/react-router";

type LinkCardProps = {
  to: string;
  title: string;
  description: string;
};

export function LinkCard({ to, title, description }: LinkCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-panel border-2 border-ink bg-surface px-5 py-4 transition-colors hover:bg-highlight"
    >
      <strong className="mb-1 block text-xl">{title}</strong>
      {description}
    </Link>
  );
}
