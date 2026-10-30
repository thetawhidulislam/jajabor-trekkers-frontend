"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from "@/hooks/use-admin";
import { ApiError } from "@/lib/api/client";
import type { AdminCategory } from "@/lib/api/admin-categories";
import { messages } from "@/messages/en";

const categorySchema = z.object({
  name: z.string().trim().min(1, messages.admin.categoryNameRequired).max(100),
});

export function AdminCategoryManager() {
  const query = useAdminCategories();
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [serverError, setServerError] = useState("");
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();
  const form = useForm({
    defaultValues: { name: "" },
    validators: { onSubmit: categorySchema },
    onSubmit: async ({ value }) => {
      setServerError("");
      try {
        if (editing) await updateMutation.mutateAsync({ id: editing.id, body: { name: value.name.trim() } });
        else await createMutation.mutateAsync({ name: value.name.trim() });
        setEditing(null);
        form.reset({ name: "" });
      } catch (error) {
        setServerError(error instanceof ApiError ? error.message : messages.admin.saveError);
      }
    },
  });
  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const beginEdit = (category: AdminCategory) => {
    setEditing(category);
    form.setFieldValue("name", category.name);
  };
  const requestDelete = (category: AdminCategory) => {
    if (window.confirm(messages.admin.categoryDeleteConfirm)) {
      deleteMutation.mutate(category.id, {
        onError: (error) => setServerError(error instanceof Error ? error.message : messages.admin.deleteError),
      });
    }
  };

  return (
    <section className="admin-page">
      <header className="admin-page-header">
        <p className="admin-eyebrow">{messages.admin.title}</p>
        <h1>{messages.admin.categoriesTitle}</h1>
      </header>
      <form className="admin-category-form" noValidate onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}>
        <form.Field name="name">{(field) => <div className="admin-field">
          <label htmlFor="admin-category-name">{messages.admin.categoryName}</label>
          <input id="admin-category-name" maxLength={100} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.currentTarget.value)} />
          {field.state.meta.errors.map((error) => <span className="admin-field-error" key={String(error)}>{String(error)}</span>)}
        </div>}</form.Field>
        <div className="admin-row-actions">
          <button className="button button-primary" type="submit" disabled={isPending}>
            {isPending ? messages.admin.saving : messages.admin.categorySave}
          </button>
          {editing && <button className="button button-outline" type="button" onClick={() => {
            setEditing(null);
            form.reset({ name: "" });
          }}>{messages.admin.categoryCancel}</button>}
        </div>
      </form>
      {serverError && <p className="admin-alert" role="alert">{serverError}</p>}
      {query.isPending ? (
        <div className="admin-skeleton-list"><div /><div /><div /></div>
      ) : query.isError ? (
        <div className="admin-empty" role="alert"><p>{query.error.message || messages.admin.error}</p><button className="button button-outline" type="button" onClick={() => void query.refetch()}>{messages.admin.retry}</button></div>
      ) : query.data.data.length === 0 ? (
        <p className="admin-empty">{messages.admin.emptyCategories}</p>
      ) : (
        <>
        <div className="admin-table-wrap admin-category-table">
          <table className="admin-table">
            <thead><tr><th>{messages.admin.categoryName}</th><th>{messages.admin.slug}</th><th>{messages.admin.actions}</th></tr></thead>
            <tbody>{query.data.data.map((category) => <tr key={category.id}>
              <td>{category.name}</td><td>{category.slug}</td>
              <td><div className="admin-row-actions">
                <button className="button button-outline" type="button" onClick={() => beginEdit(category)}>{messages.admin.edit}</button>
                <button className="button button-outline" type="button" onClick={() => requestDelete(category)}>{messages.admin.delete}</button>
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="admin-category-cards">
          {query.data.data.map((category) => <article className="admin-card" key={category.id}>
            <h2>{category.name}</h2>
            <p>{messages.admin.slug}: {category.slug}</p>
            <div className="admin-row-actions">
              <button className="button button-outline" type="button" onClick={() => beginEdit(category)}>{messages.admin.edit}</button>
              <button className="button button-outline" type="button" onClick={() => requestDelete(category)}>{messages.admin.delete}</button>
            </div>
          </article>)}
        </div>
        </>
      )}
    </section>
  );
}
