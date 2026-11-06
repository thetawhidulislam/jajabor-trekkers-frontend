"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInviteTripMember, useRemoveTripMember, useTrip, useTripMembers } from "@/hooks/use-trips";
import { ApiError } from "@/lib/api/client";
import { formatDateRange } from "@/lib/format";
import { safeImageSrc } from "@/lib/images";
import { messages } from "@/messages/en";
import { tripMemberInviteSchema } from "@/lib/validation/trip";
import { useToast } from "@/providers/toast-provider";

const PAGE_LIMIT = 50;

function getFieldErrors(errors: readonly unknown[]) {
  return errors.flatMap((error) => {
    if (typeof error === "string") return [error];
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
      return [error.message];
    }
    return [];
  });
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function MembersSkeleton() {
  return (
    <div className="trip-members-skeleton" aria-busy="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="trip-member-row skeleton" key={index} />
      ))}
    </div>
  );
}

export function TripMembersWorkspace({ tripId }: { tripId: string }) {
  const [page, setPage] = useState(1);
  const [formError, setFormError] = useState("");
  const tripQuery = useTrip(tripId);
  const membersQuery = useTripMembers(tripId, page, PAGE_LIMIT);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const inviteMutation = useInviteTripMember(tripId);
  const removeMutation = useRemoveTripMember(tripId);
  const { showToast } = useToast();

  const trip = tripQuery.data?.data;
  const isOwner = trip?.myRole === "OWNER";
  const form = useForm({
    defaultValues: { email: "" },
    validators: { onBlur: tripMemberInviteSchema, onSubmit: tripMemberInviteSchema },
    onSubmitInvalid: () => {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(".trip-invite-form [aria-invalid='true']")?.focus();
      });
    },
    onSubmit: async ({ value }) => {
      setFormError("");
      try {
        await inviteMutation.mutateAsync(value.email.trim());
        form.setFieldValue("email", "");
        setFormError("");
        showToast(messages.tripsPage.members.inviteSuccess);
      } catch (error) {
        setFormError(error instanceof ApiError ? error.message : messages.tripsPage.members.actionFailed);
      }
    },
  });

  async function removeMember(memberId: string, name: string, pending: boolean, leaving: boolean) {
    const confirmation = pending
      ? messages.tripsPage.members.cancelConfirm
      : leaving
        ? messages.tripsPage.members.leaveConfirm
        : messages.tripsPage.members.removeConfirm(name);
    if (!window.confirm(confirmation)) return;
    try {
      await removeMutation.mutateAsync(memberId);
      if (leaving) router.push("/trips");
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 409 &&
        /financial records|expenses|settlements/i.test(error.message)
      ) {
        showToast(messages.tripsPage.members.financialRecords);
        return;
      }
      showToast(error instanceof ApiError ? error.message : messages.tripsPage.members.actionFailed);
    }
  }

  if (tripQuery.isPending || membersQuery.isPending) {
    return (
      <main className="trip-shell">
        <MembersSkeleton />
      </main>
    );
  }

  if (tripQuery.isError || membersQuery.isError || !trip) {
    const error = tripQuery.error ?? membersQuery.error;
    return (
      <main className="trip-shell">
        <section className="trip-state trip-error-state">
          <h1>{messages.tripsPage.members.title}</h1>
          <p role="alert">
            {error instanceof ApiError ? error.message : messages.tripsPage.members.loadError}
          </p>
          <Button
            className="button button-outline"
            variant="outline"
            type="button"
            onClick={() => {
              void tripQuery.refetch();
              void membersQuery.refetch();
            }}
          >
            {messages.tripsPage.members.retry}
          </Button>
        </section>
      </main>
    );
  }

  const members = membersQuery.data.data;
  const meta = membersQuery.data.meta;
  const totalPages = meta?.totalPages ?? 1;
  const rows = members.map((member) => {
    const tripMember = trip.members.find((acceptedMember) => acceptedMember.id === member.id);
    const role = member.id === trip.owner.id ? "OWNER" : tripMember?.role ?? "MEMBER";
    const pending = member.status === "PENDING";
    return { member, role, pending };
  });

  return (
    <main className="trip-shell">
      <header className="trip-detail-heading">
        <div>
          <Link className="trip-back-link" href={`/trips/${encodeURIComponent(tripId)}`}>
            {messages.tripsPage.backToTrips}
          </Link>
          <h1>{messages.tripsPage.members.title}</h1>
          <p>{trip.title}{trip.startDate && trip.endDate ? ` · ${formatDateRange(trip.startDate, trip.endDate)}` : ""}</p>
        </div>
      </header>

      {isOwner && (
        <section className="trip-detail-section trip-invite-panel" aria-labelledby="invite-members-title">
          <h2 id="invite-members-title">{messages.tripsPage.members.inviteHeading}</h2>
          <form
            className="trip-invite-form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.Field name="email">
              {(field) => {
                const errors = getFieldErrors(field.state.meta.errors);
                return (
                  <div className="trip-invite-field">
                    <Label htmlFor="trip-invite-email">{messages.tripsPage.members.emailLabel}</Label>
                    <Input
                      id="trip-invite-email"
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      placeholder={messages.tripsPage.members.emailPlaceholder}
                      value={field.state.value}
                      aria-invalid={errors.length > 0}
                      aria-describedby={errors.length > 0 ? "trip-invite-email-error" : undefined}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.currentTarget.value)}
                    />
                    {errors.length > 0 && (
                      <span className="auth-field-error" id="trip-invite-email-error">
                        {errors.join(" ")}
                      </span>
                    )}
                  </div>
                );
              }}
            </form.Field>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  className="button button-primary"
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? messages.tripsPage.members.inviting : messages.tripsPage.members.invite}
                </Button>
              )}
            </form.Subscribe>
            {formError && <p className="trip-toast trip-toast-error" role="alert">{formError}</p>}
          </form>
        </section>
      )}

      <section className="trip-detail-section trip-members-panel" aria-labelledby="trip-members-title">
        <h2 id="trip-members-title">{messages.tripsPage.members.title}</h2>
        {rows.length === 0 ? (
          <p className="trip-members-empty">{messages.tripsPage.members.noMembers}</p>
        ) : (
          <ul className="trip-members-directory">
            {rows.map(({ member, role, pending }) => {
              const isTripOwner = member.id === trip.owner.id;
              const canRemove = isOwner && !isTripOwner;
              const canLeave = !isOwner && member.id === session?.user.id;
              return (
                <li className="trip-member-directory-row" key={member.id}>
                  <div className="trip-member-identity">
                    <span className="trip-member-avatar">
                      {member.image ? (
                        <Image
                          src={safeImageSrc(member.image)}
                          alt=""
                          fill
                          sizes="44px"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/destination-fallback.svg";
                          }}
                        />
                      ) : initials(member.name)}
                    </span>
                    <span className="trip-member-name">{member.name}</span>
                  </div>
                  <span className={`trip-member-role${pending ? " is-pending" : ""}`}>
                    {pending
                      ? messages.tripsPage.members.pending
                      : role === "OWNER"
                        ? messages.tripsPage.members.owner
                        : messages.tripsPage.members.member}
                  </span>
                  {(canRemove || canLeave) && (
                    <Button
                      className="button button-outline trip-member-action"
                      variant="outline"
                      type="button"
                      disabled={removeMutation.isPending}
                      onClick={() => void removeMember(member.id, member.name, pending, canLeave)}
                    >
                      {canLeave
                        ? messages.tripsPage.members.leave
                        : pending
                          ? messages.tripsPage.members.cancelInvitation
                          : messages.tripsPage.members.remove}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {totalPages > 1 && (
          <nav className="trip-pagination" aria-label={messages.tripsPage.members.pagination}>
            <Button
              className="button button-outline"
              variant="outline"
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              {messages.tripsPage.members.previousPage}
            </Button>
            <span>{messages.tripsPage.members.page(page)}</span>
            <Button
              className="button button-outline"
              variant="outline"
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              {messages.tripsPage.members.nextPage}
            </Button>
          </nav>
        )}
      </section>
    </main>
  );
}
