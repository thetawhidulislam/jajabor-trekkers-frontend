"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { TripTabs } from "@/components/trips/trip-detail";
import { useCreatePackingItem, useDeletePackingItem, usePackingList, useTogglePackingItem, useUpdatePackingItem } from "@/hooks/use-packing";
import { useTrip } from "@/hooks/use-trips";
import { ApiError } from "@/lib/api/client";
import type { PackingItem } from "@/lib/api/packing";
import { authClient } from "@/lib/auth/auth-client";
import { packingItemFormSchema, type PackingItemFormValues } from "@/lib/validation/packing";
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

function packingDefaults(item?: PackingItem): PackingItemFormValues {
  return {
    name: item?.name ?? "",
    category: item?.category ?? "",
    quantity: item?.quantity ?? 1,
  };
}

function PackingItemDialog({
  tripId,
  item,
  onClose,
}: {
  tripId: string;
  item?: PackingItem;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const createMutation = useCreatePackingItem(tripId);
  const updateMutation = useUpdatePackingItem(tripId);
  const mutation = item ? updateMutation : createMutation;
  const [serverMessage, setServerMessage] = useState("");
  const form = useForm({
    defaultValues: packingDefaults(item),
    validators: { onSubmit: packingItemFormSchema },
    onSubmit: async ({ value }) => {
      setServerMessage("");
      try {
        if (item) {
          await updateMutation.mutateAsync({
            itemId: item.id,
            body: {
              name: value.name,
              category: value.category || null,
              quantity: value.quantity,
            },
          });
        } else {
          await createMutation.mutateAsync({
            name: value.name,
            quantity: value.quantity,
            ...(value.category ? { category: value.category } : {}),
          });
        }
        dialogRef.current?.close();
      } catch (error) {
        setServerMessage(error instanceof ApiError ? error.message : messages.common.genericError);
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
      aria-labelledby="packing-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close();
      }}
    >
      <div className="trip-editor-dialog-content">
        <h2 id="packing-dialog-title">
          {item ? messages.packing.editDialogTitle : messages.packing.addDialogTitle}
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
          <form.Field name="name">
            {(field) => {
              const error = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="packing-name">{messages.packing.nameLabel}</label>
                  <input
                    id="packing-name"
                    maxLength={200}
                    value={field.state.value}
                    placeholder={messages.packing.namePlaceholder}
                    aria-invalid={Boolean(error)}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  {error && <span className="trip-field-error">{error}</span>}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="category">
            {(field) => {
              const error = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="packing-category">{messages.packing.categoryLabel}</label>
                  <input
                    id="packing-category"
                    maxLength={100}
                    value={field.state.value}
                    placeholder={messages.packing.categoryPlaceholder}
                    aria-invalid={Boolean(error)}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  {error && <span className="trip-field-error">{error}</span>}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="quantity">
            {(field) => {
              const error = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="packing-quantity">{messages.packing.quantityLabel}</label>
                  <input
                    id="packing-quantity"
                    type="number"
                    min="1"
                    max="99"
                    step="1"
                    value={field.state.value}
                    aria-invalid={Boolean(error)}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.valueAsNumber)}
                  />
                  {error && <span className="trip-field-error">{error}</span>}
                </div>
              );
            }}
          </form.Field>
          {serverMessage && <p className="trip-toast trip-toast-error" role="alert">{serverMessage}</p>}
          <div className="trip-form-actions">
            <button className="button button-outline" type="button" onClick={() => dialogRef.current?.close()}>
              {messages.packing.cancel}
            </button>
            <button className="button button-primary" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? messages.packing.saving : messages.packing.save}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

function PackingSkeleton() {
  return (
    <section className="trip-detail-section trip-packing-skeleton" aria-busy="true" aria-label={messages.packing.loading}>
      <div className="skeleton skeleton-title" />
      {[0, 1, 2, 3].map((item) => <div className="skeleton skeleton-line" key={item} />)}
    </section>
  );
}

export function PackingWorkspace({ tripId }: { tripId: string }) {
  const tripQuery = useTrip(tripId);
  const packingQuery = usePackingList(tripId);
  const sessionQuery = authClient.useSession();
  const toggleMutation = useTogglePackingItem(tripId);
  const deleteMutation = useDeletePackingItem(tripId);
  const [dialogItem, setDialogItem] = useState<PackingItem | null | undefined>();
  const [notice, setNotice] = useState("");

  const groupedItems = useMemo(() => {
    const groups = new Map<string, PackingItem[]>();
    for (const item of packingQuery.data?.data.items ?? []) {
      const category = item.category || messages.packing.noCategory;
      groups.set(category, [...(groups.get(category) ?? []), item]);
    }
    return [...groups.entries()].sort(([left], [right]) =>
      (left || messages.packing.noCategory).localeCompare(right || messages.packing.noCategory),
    );
  }, [packingQuery.data?.data.items]);

  if (tripQuery.isPending || packingQuery.isPending) {
    return <main className="trip-shell"><PackingSkeleton /></main>;
  }
  if (tripQuery.isError || packingQuery.isError) {
    const error = tripQuery.error ?? packingQuery.error;
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
          <h1>{messages.packing.errorTitle}</h1>
          <p>{error instanceof ApiError ? error.message : messages.common.genericError}</p>
          <button className="button button-primary" type="button" onClick={() => {
            void tripQuery.refetch();
            void packingQuery.refetch();
          }}>{messages.packing.retry}</button>
        </section>
      </main>
    );
  }

  const trip = tripQuery.data.data;
  const packing = packingQuery.data.data;
  const isActive = trip.status !== "COMPLETED" && trip.status !== "CANCELLED";
  const isOwner = trip.myRole === "OWNER";
  const userId = sessionQuery.data?.user.id;

  async function removeItem(item: PackingItem) {
    if (!window.confirm(messages.packing.deleteConfirm)) return;
    setNotice("");
    try {
      await deleteMutation.mutateAsync(item.id);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : messages.common.genericError);
    }
  }

  async function toggleItem(item: PackingItem) {
    setNotice("");
    try {
      await toggleMutation.mutateAsync({ itemId: item.id, isPacked: !item.isPacked });
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : messages.packing.updateError);
    }
  }

  return (
    <main className="trip-shell trip-detail-page">
      <TripTabs tripId={tripId} current="packing" />
      <header className="trip-feature-heading">
        <div>
          <p className="eyebrow">{messages.tripsPage.overviewTitle}: {trip.title}</p>
          <h1>{messages.packing.title}</h1>
        </div>
        {isActive && (
          <button className="button button-primary" type="button" onClick={() => setDialogItem(null)}>
            <Plus size={18} aria-hidden="true" />
            {messages.packing.addItem}
          </button>
        )}
      </header>
      {notice && <p className="trip-toast trip-toast-error" role="alert">{notice}</p>}
      {!isActive && <p className="trip-read-only-hint">{messages.packing.readOnly}</p>}
      <p className="trip-read-only-hint">{messages.packing.protectedFieldsHint}</p>
      <section className="trip-detail-section trip-packing-section">
        <div className="trip-packing-progress">
          <strong>{messages.packing.progress(packing.summary.packed, packing.summary.total)}</strong>
          <progress
            max={Math.max(packing.summary.total, 1)}
            value={packing.summary.packed}
            aria-label={messages.packing.progress(packing.summary.packed, packing.summary.total)}
          />
        </div>
        {packing.items.length === 0 ? (
          <div className="trip-packing-empty">
            <h2>{messages.packing.emptyTitle}</h2>
            <p>{messages.packing.emptyDescription}</p>
            {isActive && (
              <button className="button button-primary" type="button" onClick={() => setDialogItem(null)}>
                <Plus size={18} aria-hidden="true" />{messages.packing.addItem}
              </button>
            )}
          </div>
        ) : (
          <div className="trip-packing-groups">
            {groupedItems.map(([category, items]) => (
              <section className="trip-packing-group" key={category}>
                <h2>{category || messages.packing.noCategory}</h2>
                <ul className="trip-packing-list">
                  {items.map((item) => {
                    const canEdit = isOwner || Boolean(userId && item.addedBy.id === userId);
                    return (
                      <li className={`trip-packing-item${item.isPacked ? " is-packed" : ""}`} key={item.id}>
                        <label className="trip-packing-checkbox">
                          <input
                            type="checkbox"
                            checked={item.isPacked}
                            disabled={!isActive || toggleMutation.isPending}
                            aria-label={`${item.isPacked ? messages.packing.packed : messages.packing.unpacked}: ${item.name}`}
                            onChange={() => void toggleItem(item)}
                          />
                          <span className="trip-packing-item-name">{item.name}</span>
                        </label>
                        <span className="trip-packing-quantity">× {item.quantity}</span>
                        <span className="trip-packing-owner">
                          {item.assignedTo
                            ? messages.packing.assignedTo(item.assignedTo.name)
                            : messages.packing.shared}
                        </span>
                        <span className="trip-packing-added-by">{messages.packing.addedBy(item.addedBy.name)}</span>
                        {canEdit && isActive && (
                          <div className="trip-item-actions">
                            <button
                              className="trip-icon-button"
                              type="button"
                              aria-label={`${messages.packing.edit} ${item.name}`}
                              onClick={() => setDialogItem(item)}
                            ><Pencil size={17} aria-hidden="true" /></button>
                            <button
                              className="trip-icon-button"
                              type="button"
                              aria-label={`${messages.packing.delete} ${item.name}`}
                              disabled={deleteMutation.isPending}
                              onClick={() => void removeItem(item)}
                            ><Trash2 size={17} aria-hidden="true" /></button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>
      {dialogItem !== undefined && (
        <PackingItemDialog
          key={dialogItem?.id ?? "new"}
          tripId={tripId}
          item={dialogItem ?? undefined}
          onClose={() => setDialogItem(undefined)}
        />
      )}
    </main>
  );
}
