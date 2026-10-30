import Link from "next/link";
import { FolderKanban, MapPinned, MessageSquareText } from "lucide-react";
import { messages } from "@/messages/en";

const sections = [
  { href: "/admin/destinations", label: messages.admin.destinationsNav, icon: MapPinned },
  { href: "/admin/categories", label: messages.admin.categoriesNav, icon: FolderKanban },
  { href: "/admin/reviews", label: messages.admin.reviewsNav, icon: MessageSquareText },
];

export default function AdminOverviewPage() {
  return (
    <section className="admin-page">
      <header className="admin-page-header">
        <p className="admin-eyebrow">{messages.admin.title}</p>
        <h1>{messages.admin.dashboardTitle}</h1>
        <p>{messages.admin.overview}</p>
      </header>
      <div className="admin-overview-grid">
        {sections.map(({ href, label, icon: Icon }) => (
          <Link className="admin-overview-card" href={href} key={href}>
            <Icon size={28} aria-hidden="true" />
            <h2>{label}</h2>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
