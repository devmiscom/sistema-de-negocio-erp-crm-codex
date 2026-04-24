import Link from "next/link";

type Props = {
  title: string;
  description: string;
  href: string;
};

export function ModuleCard({ title, description, href }: Props) {
  return (
    <Link href={href} className="card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p className="muted" style={{ marginBottom: 0 }}>
        {description}
      </p>
    </Link>
  );
}
