"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { usePublishedDestinations } from "@/hooks/use-destinations";
import { useCreateTrip, useUpdateTrip } from "@/hooks/use-trips";
import { ApiError } from "@/lib/api/client";
import type { CreateTripBody, Trip, UpdateTripBody } from "@/lib/api/trips";
import {
  tripEditSchema,
  tripFormSchema,
  todayDhakaDateInputValue,
  type TripFormValues,
} from "@/lib/validation/trip";
import { messages } from "@/messages/en";

function dateInputValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function toApiDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function validationMessages(errors: readonly unknown[]) {
  return errors.flatMap((error) => {
    if (typeof error === "string") return [error];
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
      return [error.message];
    }
    return [];
  });
}

function defaultsFromTrip(trip?: Trip, destinationId?: string): TripFormValues {
  return {
    title: trip?.title ?? "",
    destinationId: trip?.destinationId ?? destinationId ?? "",
    startDate: dateInputValue(trip?.startDate),
    endDate: dateInputValue(trip?.endDate),
    budget: trip?.budget ?? undefined,
    notes: trip?.notes ?? "",
  };
}

export function TripForm({ trip }: { trip?: Trip }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destinationId = searchParams.get("destinationId") ?? "";
  const destinations = usePublishedDestinations();
  const createMutation = useCreateTrip();
  const updateMutation = useUpdateTrip();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState("");
  const [serverConflict, setServerConflict] = useState(false);
  const isEditing = Boolean(trip);
  const pending = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    defaultValues: defaultsFromTrip(trip, destinationId),
    validators: { onSubmit: trip ? tripEditSchema : tripFormSchema },
    onSubmit: async ({ value }) => {
      setServerErrors({});
      setServerMessage("");
      setServerConflict(false);
      try {
        if (trip) {
          const body: UpdateTripBody = {
            title: value.title,
            destinationId: value.destinationId || null,
            startDate: toApiDate(value.startDate),
            endDate: toApiDate(value.endDate),
            budget: value.budget ?? null,
            notes: value.notes || null,
          };
          await updateMutation.mutateAsync({ id: trip.id, body });
          router.push(`/trips/${encodeURIComponent(trip.id)}`);
        } else {
          const body: CreateTripBody = {
            title: value.title,
            destinationId: value.destinationId || undefined,
            startDate: toApiDate(value.startDate),
            endDate: toApiDate(value.endDate),
            budget: value.budget,
            notes: value.notes || undefined,
          };
          const result = await createMutation.mutateAsync(body);
          router.push(`/trips/${encodeURIComponent(result.data.id)}`);
        }
      } catch (error) {
        if (error instanceof ApiError) {
          const fieldErrors: Record<string, string> = {};
          for (const item of error.errors ?? []) {
            if (item.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message;
          }
          setServerErrors(fieldErrors);
          setServerMessage(error.message);
          setServerConflict(error.status === 409);
        } else {
          setServerMessage(messages.common.genericError);
        }
      }
    },
  });

  function fieldError(field: keyof TripFormValues) {
    return serverErrors[field] ?? "";
  }

  function clearServerError(field: keyof TripFormValues) {
    setServerErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function fieldErrors(errors: readonly unknown[], name: keyof TripFormValues) {
    const displayedErrors = validationMessages(errors);
    const serverError = fieldError(name);
    if (serverError && !displayedErrors.includes(serverError)) displayedErrors.push(serverError);
    return displayedErrors;
  }

  return (
    <section className="trip-form-panel">
      <header className="trip-page-heading">
        <p className="eyebrow">{messages.tripsPage.title}</p>
        <h1>{isEditing ? messages.tripForm.editTitle : messages.tripForm.createTitle}</h1>
      </header>
      <form
        className="trip-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        {serverMessage && (
          <p className={serverConflict ? "trip-toast trip-toast-error" : "trip-form-server-error"} role="alert">
            {serverMessage}
          </p>
        )}
        <form.Field name="title">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors, "title");
            return (
              <div className="trip-form-field">
                <label htmlFor="trip-title">{messages.tripForm.titleLabel}</label>
                <input
                  id="trip-title"
                  name={field.name}
                  maxLength={160}
                  value={field.state.value}
                  placeholder={messages.tripForm.titlePlaceholder}
                  aria-invalid={errors.length > 0}
                  aria-describedby={errors.length ? "trip-title-error" : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearServerError("title");
                    field.handleChange(event.currentTarget.value);
                  }}
                />
                {errors.length > 0 && <span className="trip-field-error" id="trip-title-error">{errors.join(" ")}</span>}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="destinationId">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors, "destinationId");
            return (
              <div className="trip-form-field">
                <label htmlFor="trip-destination">{messages.tripForm.destinationLabel}</label>
                <select
                  id="trip-destination"
                  name={field.name}
                  value={field.state.value}
                  aria-invalid={errors.length > 0}
                  aria-describedby={errors.length ? "trip-destination-error" : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearServerError("destinationId");
                    field.handleChange(event.currentTarget.value);
                  }}
                >
                  <option value="">{messages.tripForm.chooseDestination}</option>
                  {destinations.data?.map((destination) => (
                    <option key={destination.id} value={destination.id}>{destination.name}</option>
                  ))}
                </select>
                {destinations.isPending && <span className="trip-field-hint">{messages.tripForm.destinationLoading}</span>}
                {destinations.isError && <span className="trip-field-hint">{messages.tripForm.destinationError}</span>}
                {errors.length > 0 && <span className="trip-field-error" id="trip-destination-error">{errors.join(" ")}</span>}
              </div>
            );
          }}
        </form.Field>

        <div className="trip-form-grid">
          <form.Field name="startDate">
            {(field) => {
              const errors = fieldErrors(field.state.meta.errors, "startDate");
              return (
                <div className="trip-form-field">
                  <label htmlFor="trip-start-date">{messages.tripForm.startDateLabel}</label>
                  <input
                    id="trip-start-date"
                    name={field.name}
                    type="date"
                    min={todayDhakaDateInputValue()}
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    aria-describedby={errors.length ? "trip-start-date-error" : undefined}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      clearServerError("startDate");
                      field.handleChange(event.currentTarget.value);
                    }}
                  />
                  {errors.length > 0 && <span className="trip-field-error" id="trip-start-date-error">{errors.join(" ")}</span>}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="endDate">
            {(field) => {
              const errors = fieldErrors(field.state.meta.errors, "endDate");
              return (
                <div className="trip-form-field">
                  <label htmlFor="trip-end-date">{messages.tripForm.endDateLabel}</label>
                  <input
                    id="trip-end-date"
                    name={field.name}
                    type="date"
                    min={form.state.values.startDate || todayDhakaDateInputValue()}
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    aria-describedby={errors.length ? "trip-end-date-error" : undefined}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      clearServerError("endDate");
                      field.handleChange(event.currentTarget.value);
                    }}
                  />
                  {errors.length > 0 && <span className="trip-field-error" id="trip-end-date-error">{errors.join(" ")}</span>}
                </div>
              );
            }}
          </form.Field>
        </div>

        <form.Field name="budget">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors, "budget");
            return (
              <div className="trip-form-field">
                <label htmlFor="trip-budget">{messages.tripForm.budgetLabel}</label>
                <input
                  id="trip-budget"
                  name={field.name}
                  type="number"
                  min="0"
                  step="any"
                  value={field.state.value ?? ""}
                  aria-invalid={errors.length > 0}
                  aria-describedby={errors.length ? "trip-budget-error" : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearServerError("budget");
                    const raw = event.currentTarget.value;
                    field.handleChange(raw === "" ? undefined : event.currentTarget.valueAsNumber);
                  }}
                />
                {errors.length > 0 && <span className="trip-field-error" id="trip-budget-error">{errors.join(" ")}</span>}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="notes">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors, "notes");
            return (
              <div className="trip-form-field">
                <label htmlFor="trip-notes">{messages.tripForm.notesLabel}</label>
                <textarea
                  id="trip-notes"
                  name={field.name}
                  maxLength={4000}
                  rows={5}
                  value={field.state.value}
                  placeholder={messages.tripForm.notesPlaceholder}
                  aria-invalid={errors.length > 0}
                  aria-describedby={errors.length ? "trip-notes-error" : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearServerError("notes");
                    field.handleChange(event.currentTarget.value);
                  }}
                />
                {errors.length > 0 && <span className="trip-field-error" id="trip-notes-error">{errors.join(" ")}</span>}
              </div>
            );
          }}
        </form.Field>

        <div className="trip-form-actions">
          <button className="button button-primary" type="submit" disabled={pending}>
            {pending
              ? isEditing ? messages.tripForm.saving : messages.tripForm.creating
              : isEditing ? messages.tripsPage.updateTrip : messages.tripForm.create}
          </button>
          <Link className="button button-outline" href={trip ? `/trips/${encodeURIComponent(trip.id)}` : "/trips"}>
            {messages.tripForm.cancel}
          </Link>
        </div>
      </form>
    </section>
  );
}
