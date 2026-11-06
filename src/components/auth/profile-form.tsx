"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { authClient, type AppUser } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { UpdateProfileBody } from "@/lib/api/users";
import { updateProfile } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { profileSchema } from "@/lib/validation/auth";
import { messages } from "@/messages/en";
import { useToast } from "@/providers/toast-provider";

function fieldErrors(errors: readonly unknown[]): string[] {
  return errors.flatMap((error) => {
    if (typeof error === "string") return [error];
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) return [error.message];
    return [];
  });
}

export function ProfileForm() {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <main className="trip-shell" aria-busy="true">
        <div className="trip-state">
          <Skeleton className="skeleton skeleton-title" />
          <Skeleton className="skeleton skeleton-line" />
        </div>
      </main>
    );
  }
  if (error || !user || (user.role !== "USER" && user.role !== "ADMIN")) {
    return (
      <main className="trip-shell">
        <section className="trip-state trip-error-state">
          <h1>{messages.auth.profileTitle}</h1>
          <p role="alert">{messages.auth.sessionError}</p>
          <button className="button button-outline" type="button" onClick={() => void refetch()}>
            {messages.common.retry}
          </button>
        </section>
      </main>
    );
  }

  return (
    <ProfileEditor
      key={user.id}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        role: user.role,
        phone: user.phone ?? undefined,
      }}
      onSessionRefresh={refetch}
    />
  );
}

function ProfileEditor({
  user,
  onSessionRefresh,
}: {
  user: AppUser;
  onSessionRefresh: () => Promise<void>;
}) {
  const [serverError, setServerError] = useState("");
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const form = useForm({
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
    },
    validators: { onBlur: profileSchema, onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      setServerError("");
      const body: UpdateProfileBody = {};
      if (value.name.trim() !== user.name) body.name = value.name.trim();
      if (value.phone.trim() !== (user.phone ?? "")) body.phone = value.phone.trim();

      try {
        if (Object.keys(body).length > 0) {
          try {
            await updateProfile(body);
          } catch (updateError) {
            const phoneRejected =
              updateError instanceof ApiError &&
              updateError.status === 400 &&
              body.phone === "" &&
              updateError.errors?.some((fieldError) => fieldError.field === "phone");
            if (
              !phoneRejected
            ) {
              throw updateError;
            }
            const bodyWithoutPhone = { ...body };
            delete bodyWithoutPhone.phone;
            if (Object.keys(bodyWithoutPhone).length === 0) {
              setServerError(messages.auth.phoneCannotClear);
              return;
            }
            await updateProfile(bodyWithoutPhone);
          }
        }
        await onSessionRefresh();
        await queryClient.invalidateQueries();
        form.reset({
          name: value.name.trim(),
          phone: body.phone === "" && user.phone ? user.phone : value.phone.trim(),
        });
        showToast(messages.auth.profileUpdated);
      } catch {
        setServerError(messages.auth.genericError);
      }
    },
    onSubmitInvalid: () => {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(".profile-card [aria-invalid='true']")?.focus();
      });
    },
  });

  return (
    <main className="trip-shell">
      <header className="trip-page-heading">
        <div>
          <p className="eyebrow">{messages.auth.eyebrow}</p>
          <h1>{messages.auth.profileTitle}</h1>
        </div>
      </header>
      <Card className="trip-detail-section profile-card" aria-label={messages.auth.profileTitle}>
        <dl className="profile-summary">
          <div>
            <dt>{messages.auth.nameLabel}</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>{messages.auth.emailLabel}</dt>
            <dd>{user.email}</dd>
          </div>
          {user.role === "ADMIN" && (
            <div>
              <dt>{messages.auth.accountType}</dt>
              <dd><span className="profile-admin-badge">{messages.auth.adminBadge}</span></dd>
            </div>
          )}
        </dl>
        <form
          className="auth-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => {
              const errors = fieldErrors(field.state.meta.errors);
              return (
                <div className="auth-field">
                  <Label htmlFor="profile-name">{messages.auth.nameLabel}</Label>
                  <Input
                    className="auth-input"
                    id="profile-name"
                    type="text"
                    autoComplete="name"
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    aria-describedby={errors.length > 0 ? "profile-name-error" : undefined}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  {errors.length > 0 && (
                    <span className="auth-field-error" id="profile-name-error">{errors.join(" ")}</span>
                  )}
                </div>
              );
            }}
          </form.Field>
          <div className="auth-field">
            <Label htmlFor="profile-email">{messages.auth.emailLabel}</Label>
            <Input className="auth-input" id="profile-email" type="email" autoComplete="email" value={user.email} readOnly />
          </div>
          <form.Field name="phone">
            {(field) => {
              const errors = fieldErrors(field.state.meta.errors);
              return (
                <div className="auth-field">
                  <Label htmlFor="profile-phone">{messages.auth.phoneLabel}</Label>
                  <Input
                    className="auth-input"
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    aria-describedby={errors.length > 0 ? "profile-phone-error" : undefined}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  {errors.length > 0 && (
                    <span className="auth-field-error" id="profile-phone-error">{errors.join(" ")}</span>
                  )}
                </div>
              );
            }}
          </form.Field>
          {serverError && <p className="auth-notice auth-notice-error" role="alert">{serverError}</p>}
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button className="button button-primary auth-submit" variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? messages.auth.savingProfile : messages.auth.saveProfile}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>
    </main>
  );
}
