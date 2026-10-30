"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { TripTabs } from "@/components/trips/trip-detail";
import { useCreateItineraryItem, useDeleteItineraryItem, useItinerary, useReorderItineraryItems, useUpdateItineraryItem } from "@/hooks/use-itinerary";
import { useTrip } from "@/hooks/use-trips";
import { ApiError } from "@/lib/api/client";
import type { ItineraryDay, ItineraryItem } from "@/lib/api/itinerary";
import type { Trip } from "@/lib/api/trips";
import { formatDate, formatDateRange, formatMoney } from "@/lib/format";
import { itineraryItemFormSchemaForDays, type ItineraryItemFormValues } from "@/lib/validation/itinerary";
import { messages } from "@/messages/en";

function validationMessages(errors: readonly unknown[]) {
  return errors.flatMap((error) => {
    if (typeof error === "string") return [error];
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
      return [error.message];
    }
    return [];
  });
}

function itemDefaults(item?: ItineraryItem, dayNumber = 1): ItineraryItemFormValues {
  return {
    dayNumber: item?.dayNumber ?? dayNumber,
    startTime: item?.startTime ?? "",
    title: item?.title ?? "",
    description: item?.description ?? "",
    location: item?.location ?? "",
    estimatedCost: item?.estimatedCost ?? undefined,
  };
}

function ItineraryItemDialog({
  tripId,
  dayCount,
  dayNumber,
  item,
  onClose,
  onError,
}: {
  tripId: string;
  dayCount: number;
  dayNumber: number;
  item?: ItineraryItem;
  onClose: () => void;
  onError: (message: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const createMutation = useCreateItineraryItem(tripId);
  const updateMutation = useUpdateItineraryItem(tripId);
  const mutation = item ? updateMutation : createMutation;
  const form = useForm({
    defaultValues: itemDefaults(item, dayNumber),
    validators: { onSubmit: itineraryItemFormSchemaForDays(dayCount) },
    onSubmit: async ({ value }) => {
      const body = {
        dayNumber: value.dayNumber,
        title: value.title,
        ...(value.startTime ? { startTime: value.startTime } : {}),
        description: value.description,
        location: value.location,
        ...(value.estimatedCost !== undefined ? { estimatedCost: value.estimatedCost } : {}),
      };
      try {
        if (item) await updateMutation.mutateAsync({ itemId: item.id, body });
        else await createMutation.mutateAsync(body);
        dialogRef.current?.close();
      } catch (error) {
        onError(error instanceof ApiError ? error.message : messages.common.genericError);
      }
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  function fieldErrors(errors: readonly unknown[]) {
    return validationMessages(errors).join(" ");
  }

  return (
    <dialog
      ref={dialogRef}
      className="trip-editor-dialog"
      aria-labelledby="itinerary-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close();
      }}
    >
      <div className="trip-editor-dialog-content">
        <h2 id="itinerary-dialog-title">
          {item ? messages.itinerary.editDialogTitle : messages.itinerary.addDialogTitle}
        </h2>
        <form
          className="trip-editor-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="dayNumber">
            {(field) => {
              const error = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="itinerary-day">{messages.itinerary.dayNumberLabel}</label>
                  <select
                    id="itinerary-day"
                    value={field.state.value}
                    aria-invalid={Boolean(error)}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(Number(event.currentTarget.value))}
                  >
                    {Array.from({ length: dayCount }, (_, index) => (
                      <option key={index + 1} value={index + 1}>{messages.itinerary.dayLabel(index + 1)}</option>
                    ))}
                  </select>
                  {error && <span className="trip-field-error">{error}</span>}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="title">
            {(field) => {
              const error = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="itinerary-title">{messages.itinerary.titleLabel}</label>
                  <input
                    id="itinerary-title"
                    maxLength={160}
                    value={field.state.value}
                    placeholder={messages.itinerary.titlePlaceholder}
                    aria-invalid={Boolean(error)}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  {error && <span className="trip-field-error">{error}</span>}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="startTime">
            {(field) => {
              const error = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="itinerary-time">{messages.itinerary.timeLabel}</label>
                  <input
                    id="itinerary-time"
                    type="time"
                    value={field.state.value}
                    aria-invalid={Boolean(error)}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  {error && <span className="trip-field-error">{error}</span>}
                  {item?.startTime && (
                    <span className="trip-field-hint">{messages.itinerary.timeCannotClear}</span>
                  )}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="location">
            {(field) => (
              <div className="trip-form-field">
                <label htmlFor="itinerary-location">{messages.itinerary.locationLabel}</label>
                <input
                  id="itinerary-location"
                  maxLength={500}
                  value={field.state.value}
                  placeholder={messages.itinerary.locationPlaceholder}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <div className="trip-form-field">
                <label htmlFor="itinerary-notes">{messages.itinerary.notesLabel}</label>
                <textarea
                  id="itinerary-notes"
                  maxLength={4000}
                  rows={3}
                  value={field.state.value}
                  placeholder={messages.itinerary.notesPlaceholder}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="estimatedCost">
            {(field) => {
              const error = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="itinerary-cost">{messages.itinerary.estimatedCostLabel}</label>
                  <input
                    id="itinerary-cost"
                    type="number"
                    min="0"
                    step="any"
                    value={field.state.value ?? ""}
                    aria-invalid={Boolean(error)}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      const raw = event.currentTarget.value;
                      field.handleChange(raw === "" ? undefined : event.currentTarget.valueAsNumber);
                    }}
                  />
                  {error && <span className="trip-field-error">{error}</span>}
                  {item?.estimatedCost !== null && item?.estimatedCost !== undefined && (
                    <span className="trip-field-hint">{messages.itinerary.costCannotClear}</span>
                  )}
                </div>
              );
            }}
          </form.Field>
          {mutation.isError && (
            <p className="trip-toast trip-toast-error" role="alert">
              {mutation.error instanceof ApiError ? mutation.error.message : messages.common.genericError}
            </p>
          )}
          <div className="trip-form-actions">
            <button className="button button-outline" type="button" onClick={() => dialogRef.current?.close()}>
              {messages.itinerary.cancel}
            </button>
            <button className="button button-primary" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? messages.itinerary.saving : messages.itinerary.save}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

function ItinerarySkeleton() {
  return (
    <section className="trip-itinerary-days" aria-busy="true" aria-label={messages.itinerary.loading}>
      {[0, 1, 2].map((day) => (
        <div className="trip-detail-section" key={day}>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
        </div>
      ))}
    </section>
  );
}

function dayDate(startDate: string | null, dayNumber: number) {
  if (!startDate) return null;
  const date = new Date(startDate);
  if (Number.isNaN(date.valueOf())) return null;
  date.setUTCDate(date.getUTCDate() + dayNumber - 1);
  return formatDate(date);
}

export function ItineraryWorkspace({ tripId }: { tripId: string }) {
  const tripQuery = useTrip(tripId);
  const itineraryQuery = useItinerary(tripId);
  const deleteMutation = useDeleteItineraryItem(tripId);
  const reorderMutation = useReorderItineraryItems(tripId);
  const [dialog, setDialog] = useState<{ dayNumber: number; item?: ItineraryItem } | null>(null);
  const [notice, setNotice] = useState("");

  if (tripQuery.isPending || itineraryQuery.isPending) {
    return <main className="trip-shell"><ItinerarySkeleton /></main>;
  }
  if (tripQuery.isError || itineraryQuery.isError) {
    const error = tripQuery.error ?? itineraryQuery.error;
    if (error instanceof ApiError && error.isNotFound) {
      return (
        <main className="trip-shell">
          <section className="trip-state trip-not-found" role="alert">
            <h1>{messages.tripsPage.notFoundTitle}</h1>
            <p>{messages.tripsPage.notFoundDescription}</p>
          </section>
        </main>
      );
    }
    return (
      <main className="trip-shell">
        <section className="trip-state trip-error-state" role="alert">
          <h1>{messages.itinerary.errorTitle}</h1>
          <p>{error instanceof ApiError ? error.message : messages.common.genericError}</p>
          <button className="button button-primary" type="button" onClick={() => {
            void tripQuery.refetch();
            void itineraryQuery.refetch();
          }}>{messages.itinerary.retry}</button>
        </section>
      </main>
    );
  }

  const trip: Trip = tripQuery.data.data;
  const itinerary = itineraryQuery.data.data;
  const canWrite = trip.myRole === "OWNER" && trip.status !== "COMPLETED" && trip.status !== "CANCELLED";
  const dateRange = trip.startDate && trip.endDate
    ? formatDateRange(trip.startDate, trip.endDate)
    : messages.tripsPage.datesNotSet;
  const empty = itinerary.days.every((day) => day.items.length === 0);

  async function removeItem(item: ItineraryItem) {
    if (!window.confirm(messages.itinerary.deleteConfirm)) return;
    setNotice("");
    try {
      await deleteMutation.mutateAsync(item.id);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : messages.common.genericError);
    }
  }

  async function moveItem(day: ItineraryDay, index: number, offset: -1 | 1) {
    const reordered = [...day.items];
    const target = index + offset;
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setNotice("");
    try {
      await reorderMutation.mutateAsync({
        dayNumber: day.dayNumber,
        itemIds: reordered.map(({ id }) => id),
      });
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : messages.common.genericError);
    }
  }

  return (
    <main className="trip-shell trip-detail-page">
      <TripTabs tripId={tripId} current="itinerary" />
      <header className="trip-feature-heading">
        <div>
          <p className="eyebrow">{messages.itinerary.datesContext(dateRange)}</p>
          <h1>{messages.itinerary.title}</h1>
        </div>
        {canWrite && (
          <button className="button button-primary" type="button" onClick={() => setDialog({ dayNumber: 1 })}>
            <Plus size={18} aria-hidden="true" />
            {messages.itinerary.addItem}
          </button>
        )}
      </header>
      {!canWrite && trip.status !== "COMPLETED" && trip.status !== "CANCELLED" && (
        <p className="trip-read-only-hint">{messages.itinerary.readOnly}</p>
      )}
      {trip.status === "COMPLETED" || trip.status === "CANCELLED" ? (
        <p className="trip-read-only-hint">{messages.packing.readOnly}</p>
      ) : null}
      {notice && <p className="trip-toast trip-toast-error" role="alert">{notice}</p>}
      {empty && (
        <section className="trip-state trip-empty-state">
          <h2>{messages.itinerary.addFirstItem}</h2>
          <p>{messages.itinerary.emptyDescription}</p>
          {canWrite && (
            <button className="button button-primary" type="button" onClick={() => setDialog({ dayNumber: 1 })}>
              <Plus size={18} aria-hidden="true" />
              {messages.itinerary.addFirstItem}
            </button>
          )}
        </section>
      )}
      <div className="trip-itinerary-days">
        {itinerary.days.map((day) => (
          <section className="trip-detail-section trip-itinerary-day" key={day.dayNumber}>
            <header className="trip-itinerary-day-heading">
              <div>
                <h2>{messages.itinerary.dayLabel(day.dayNumber)}</h2>
                {dayDate(trip.startDate, day.dayNumber) && (
                  <p>{dayDate(trip.startDate, day.dayNumber)}</p>
                )}
              </div>
              {canWrite && (
                <button className="button button-outline" type="button" onClick={() => setDialog({ dayNumber: day.dayNumber })}>
                  <Plus size={17} aria-hidden="true" />{messages.itinerary.addItem}
                </button>
              )}
            </header>
            {day.items.length === 0 ? (
              <p className="trip-itinerary-empty-day">{messages.itinerary.emptyDescription}</p>
            ) : (
              <ol className="trip-itinerary-list">
                {day.items.map((item, index) => (
                  <li className="trip-itinerary-item" key={item.id}>
                    <span className="trip-itinerary-time">{item.startTime ?? messages.itinerary.noTime}</span>
                    <div className="trip-itinerary-item-content">
                      <h3>{item.title}</h3>
                      {item.location && <p className="trip-itinerary-location">{item.location}</p>}
                      {item.description && <p className="trip-itinerary-notes">{item.description}</p>}
                      {item.estimatedCost !== null && (
                        <p className="trip-itinerary-cost">{formatMoney(item.estimatedCost)}</p>
                      )}
                    </div>
                    {canWrite && (
                      <div className="trip-item-actions">
                        <button
                          className="trip-icon-button"
                          type="button"
                          aria-label={messages.itinerary.moveEarlier(item.title)}
                          disabled={index === 0 || reorderMutation.isPending}
                          onClick={() => void moveItem(day, index, -1)}
                        ><ArrowUp size={17} aria-hidden="true" /></button>
                        <button
                          className="trip-icon-button"
                          type="button"
                          aria-label={messages.itinerary.moveLater(item.title)}
                          disabled={index === day.items.length - 1 || reorderMutation.isPending}
                          onClick={() => void moveItem(day, index, 1)}
                        ><ArrowDown size={17} aria-hidden="true" /></button>
                        <button
                          className="trip-icon-button"
                          type="button"
                          aria-label={`${messages.itinerary.edit} ${item.title}`}
                          onClick={() => setDialog({ dayNumber: day.dayNumber, item })}
                        ><Pencil size={17} aria-hidden="true" /></button>
                        <button
                          className="trip-icon-button"
                          type="button"
                          aria-label={`${messages.itinerary.delete} ${item.title}`}
                          disabled={deleteMutation.isPending}
                          onClick={() => void removeItem(item)}
                        ><Trash2 size={17} aria-hidden="true" /></button>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>
      <p className="trip-itinerary-total">
        <strong>{messages.itinerary.costTotal}</strong> {formatMoney(itinerary.totalEstimatedCost)}
      </p>
      {dialog && (
        <ItineraryItemDialog
          key={dialog.item?.id ?? `new-${dialog.dayNumber}`}
          tripId={tripId}
          dayCount={itinerary.days.length}
          dayNumber={dialog.dayNumber}
          item={dialog.item}
          onClose={() => setDialog(null)}
          onError={setNotice}
        />
      )}
    </main>
  );
}
