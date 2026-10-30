"use client";

import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { FolderKanban, MapPinned, MessageSquareText, LayoutDashboard, Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { messages } from "@/messages/en";

const AdminUnsavedContext = createContext<(dirty: boolean) => void>(() => undefined);

export function useAdminUnsavedChanges() {
  return useContext(AdminUnsavedContext);
}

const navItems = [
  { href: "/admin", label: messages.admin.overviewNav, icon: LayoutDashboard },
  { href: "/admin/destinations", label: messages.admin.destinationsNav, icon: MapPinned },
  { href: "/admin/categories", label: messages.admin.categoriesNav, icon: FolderKanban },
  { href: "/admin/reviews", label: messages.admin.reviewsNav, icon: MessageSquareText },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const contextValue = useMemo(() => setHasUnsavedChanges, []);
  const user = session?.user;
  const isAdmin = Boolean(user && "role" in user && user.role === "ADMIN");

  if (isPending) {
    return <main className="admin-loading" aria-label={messages.admin.loading}><div className="admin-skeleton" /></main>;
  }
  if (error) {
    return (
      <main className="admin-loading">
        <p role="alert">{messages.admin.error}</p>
        <button className="button button-outline" type="button" onClick={() => void refetch()}>{messages.admin.retry}</button>
      </main>
    );
  }
  if (!isAdmin) notFound();

  const handleNavigation = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a");
    if (!anchor || !hasUnsavedChanges) return;
    if (!window.confirm(messages.admin.unsaved)) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      setHasUnsavedChanges(false);
    }
  };

  return (
    <AdminUnsavedContext.Provider value={contextValue}>
      <div className="admin-shell" onClickCapture={handleNavigation}>
        <header className="admin-mobile-bar">
          <Link className="admin-brand" href="/admin">{messages.app.name}</Link>
          <button
            type="button"
            className="admin-icon-button"
            aria-label={drawerOpen ? messages.admin.closeMenu : messages.admin.menu}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            {drawerOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </header>
        <aside className={`admin-sidebar${drawerOpen ? " is-open" : ""}`}>
          <Link className="admin-brand admin-brand-desktop" href="/admin">{messages.app.name}</Link>
          <nav aria-label={messages.admin.navLabel}>
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                onClick={() => setDrawerOpen(false)}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </AdminUnsavedContext.Provider>
  );
}
