"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { messages } from "@/messages/en";
import { useToast } from "@/providers/toast-provider";
import { safeImageSrc } from "@/lib/images";
import { usePendingInvitations } from "@/hooks/use-invitations";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function UserMenu({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const user = session?.user;
  const invitationsQuery = usePendingInvitations(Boolean(user));
  const invitationCount = invitationsQuery.data?.meta?.total ?? invitationsQuery.data?.data.length ?? 0;
  const menuClass = mobile ? "user-menu user-menu-mobile" : "user-menu user-menu-desktop";

  if (isPending) {
    return <span className={`${menuClass} user-menu-skeleton`} aria-hidden="true" />;
  }

  if (error) {
    return (
      <button
        className={`${menuClass} user-menu-retry`}
        type="button"
        onClick={() => void refetch()}
      >
        {messages.home.userMenu.retrySession}
      </button>
    );
  }

  if (!user) {
    return (
      <div className={`${menuClass} user-menu-signed-out`}>
        <Link className="button button-outline user-menu-login" href="/login" onClick={onNavigate}>
          {messages.auth.logIn}
        </Link>
        <Link className="button button-primary user-menu-signup" href="/signup" onClick={onNavigate}>
          {messages.home.userMenu.signUp}
        </Link>
      </div>
    );
  }

  async function logOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        showToast(messages.home.userMenu.logOutError);
        return;
      }
      queryClient.clear();
      showToast(messages.auth.loggedOut);
      setOpen(false);
      onNavigate?.();
      router.replace("/");
      router.refresh();
    } catch {
      showToast(messages.home.userMenu.logOutError);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <DropdownMenu
      className={`${menuClass}${open ? " is-open" : ""}`}
      open={open}
      onOpenChange={setOpen}
      trigger={(triggerProps) => (
        <Button
          {...triggerProps}
          className="user-avatar-button"
          variant="ghost"
          aria-label={messages.home.userMenu.accountMenu}
        >
          <span className="user-avatar">
            {user.image ? (
              <Image
                src={safeImageSrc(user.image)}
                alt=""
                width={40}
                height={40}
                unoptimized
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/destination-fallback.svg";
                }}
              />
            ) : (
              initials(user.name)
            )}
          </span>
          <span className="user-avatar-name">{user.name}</span>
        </Button>
      )}
    >
      <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-header">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Link role="menuitem" href="/trips" onClick={() => { setOpen(false); onNavigate?.(); }}>
            {messages.home.userMenu.myTrips}
          </Link>
          <Link role="menuitem" href="/invitations" onClick={() => { setOpen(false); onNavigate?.(); }}>
            <span>{messages.home.userMenu.invitations}</span>
            {invitationCount > 0 && (
              <span className="user-menu-count" aria-label={messages.home.userMenu.invitationCount(invitationCount)}>
                {invitationCount > 99 ? "99+" : invitationCount}
              </span>
            )}
          </Link>
          <Link role="menuitem" href="/profile" onClick={() => { setOpen(false); onNavigate?.(); }}>
            {messages.home.userMenu.profile}
          </Link>
          {user.role === "ADMIN" && (
            <Link role="menuitem" href="/admin" onClick={() => { setOpen(false); onNavigate?.(); }}>
              {messages.home.userMenu.adminDashboard}
            </Link>
          )}
          <Button
            className="user-menu-logout"
            variant="ghost"
            role="menuitem"
            type="button"
            disabled={loggingOut}
            onClick={() => void logOut()}
          >
            {loggingOut ? messages.home.userMenu.loggingOut : messages.home.userMenu.logOut}
          </Button>
      </div>
    </DropdownMenu>
  );
}
