"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { ApiError } from "@/lib/api/client";
import type {
  AdminDestination,
  CreateDestinationBody,
  DestinationImageInput,
  DestinationStatus,
  UpdateDestinationBody,
} from "@/lib/api/admin-destinations";
import { useAdminCategories, useAdminDestination, useCreateAdminDestination, useSetAdminDestinationFeatured, useSetAdminDestinationStatus, useUpdateAdminDestination } from "@/hooks/use-admin";
import { useAdminUnsavedChanges } from "@/components/admin/admin-shell";
import { ImageUpload } from "@/components/admin/image-upload";
import { adminDestinationSchema, type AdminDestinationFormValues } from "@/lib/validation/destination";
import { messages } from "@/messages/en";

type GalleryImage = { url: string; caption: string };
type TextFieldName = "name" | "slug" | "division" | "district" | "locationText" | "latitude" | "longitude" | "bestTimeToVisit" | "lastVerifiedAt";
type NumberFieldName = "estimatedCostMin" | "estimatedCostMax" | "recommendedDays";
type TextAreaFieldName = "description" | "activities" | "safetyNotes" | "permissionNote";

function validationMessages(errors: readonly unknown[]) {
  return errors.flatMap((error) => {
    if (typeof error === "string") return [error];
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
      return [error.message];
    }
    return [];
  });
}

function initialValues(destination?: AdminDestination): AdminDestinationFormValues {
  return {
    name: destination?.name ?? "",
    slug: destination?.slug ?? "",
    division: destination?.division ?? "",
    district: destination?.district ?? "",
    locationText: destination?.locationText ?? "",
    latitude: destination?.latitude === null || destination?.latitude === undefined ? "" : String(destination.latitude),
    longitude: destination?.longitude === null || destination?.longitude === undefined ? "" : String(destination.longitude),
    description: destination?.description ?? "",
    coverImage: destination?.coverImage ?? "",
    estimatedCostMin: destination?.estimatedCostMin ?? 0,
    estimatedCostMax: destination?.estimatedCostMax ?? 0,
    recommendedDays: destination?.recommendedDays ?? 1,
    bestTimeToVisit: destination?.bestTimeToVisit ?? "",
    activities: destination?.activities?.join("\n") ?? "",
    difficulty: destination?.difficulty ?? "EASY",
    isFeatured: destination?.isFeatured ?? false,
    safetyNotes: destination?.safetyNotes ?? "",
    permissionRequired: destination?.permissionRequired ?? false,
    permissionNote: destination?.permissionNote ?? "",
    lastVerifiedAt: destination?.lastVerifiedAt ? destination.lastVerifiedAt.slice(0, 10) : "",
    categoryId: destination?.categoryId ?? "",
  };
}

function optionalText(value: string) {
  return value.trim() || null;
}

function imagePayload(images: GalleryImage[]): DestinationImageInput[] {
  return images.map((image, index) => ({
    url: image.url,
    ...(image.caption.trim() ? { caption: image.caption.trim() } : {}),
    sortOrder: index,
  }));
}

function galleryChanged(original: GalleryImage[], current: GalleryImage[]) {
  return original.length !== current.length || original.some((image, index) =>
    image.url !== current[index]?.url || image.caption !== current[index]?.caption,
  );
}

function UnsavedChangeTracker({ dirty }: { dirty: boolean }) {
  const setUnsaved = useAdminUnsavedChanges();
  useEffect(() => {
    setUnsaved(dirty);
    return () => setUnsaved(false);
  }, [dirty, setUnsaved]);
  return null;
}

export function DestinationEditor({ destinationId }: { destinationId?: string }) {
  const destinationQuery = useAdminDestination(destinationId ?? "");
  const categoriesQuery = useAdminCategories();
  if (destinationId && destinationQuery.isPending) {
    return <main className="admin-page"><div className="admin-skeleton-list"><div /><div /><div /></div></main>;
  }
  if ((destinationId && destinationQuery.isError) || categoriesQuery.isError) {
    const error = destinationQuery.error ?? categoriesQuery.error;
    return (
      <main className="admin-page">
        <div className="admin-empty" role="alert">
          <p>{error instanceof Error ? error.message : messages.admin.error}</p>
          <button type="button" className="button button-outline" onClick={() => {
            void destinationQuery.refetch();
            void categoriesQuery.refetch();
          }}>{messages.admin.retry}</button>
        </div>
      </main>
    );
  }
  if (categoriesQuery.isPending || (destinationId && !destinationQuery.data)) {
    return <main className="admin-page"><div className="admin-skeleton-list"><div /><div /></div></main>;
  }
  return (
    <DestinationEditorForm
      destination={destinationQuery.data?.data}
      categories={categoriesQuery.data?.data ?? []}
    />
  );
}

function DestinationEditorForm({
  destination,
  categories,
}: {
  destination?: AdminDestination;
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const setUnsavedChanges = useAdminUnsavedChanges();
  const createMutation = useCreateAdminDestination();
  const updateMutation = useUpdateAdminDestination();
  const setStatusMutation = useSetAdminDestinationStatus();
  const setFeaturedMutation = useSetAdminDestinationFeatured();
  const [persistedStatus, setPersistedStatus] = useState<NonNullable<DestinationStatus>>(destination?.status ?? "DRAFT");
  const [persistedFeatured, setPersistedFeatured] = useState(destination?.isFeatured ?? false);
  const [gallery, setGallery] = useState<GalleryImage[]>(
    destination?.images ? [...destination.images].sort((a, b) => a.sortOrder - b.sortOrder).map((image) => ({
      url: image.url,
      caption: image.caption ?? "",
    })) : [],
  );
  const [savedGallery, setSavedGallery] = useState<GalleryImage[]>(gallery);
  const [serverError, setServerError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [savingStatus, setSavingStatus] = useState<NonNullable<DestinationStatus>>("DRAFT");
  const mutationPending = createMutation.isPending || updateMutation.isPending || setStatusMutation.isPending || setFeaturedMutation.isPending;
  const form = useForm({
    defaultValues: initialValues(destination),
    validators: { onSubmit: adminDestinationSchema },
    onSubmit: async ({ value }) => {
      setServerError("");
      const { slug, ...formValues } = value;
      const common = {
        name: formValues.name.trim(),
        division: formValues.division.trim(),
        district: optionalText(formValues.district),
        locationText: optionalText(formValues.locationText),
        latitude: formValues.latitude.trim() ? Number(formValues.latitude) : null,
        longitude: formValues.longitude.trim() ? Number(formValues.longitude) : null,
        description: formValues.description.trim(),
        coverImage: formValues.coverImage,
        estimatedCostMin: formValues.estimatedCostMin,
        estimatedCostMax: formValues.estimatedCostMax,
        recommendedDays: formValues.recommendedDays,
        bestTimeToVisit: optionalText(formValues.bestTimeToVisit),
        activities: formValues.activities.split(/\r?\n/).map((activity) => activity.trim()).filter(Boolean),
        difficulty: formValues.difficulty,
        safetyNotes: optionalText(formValues.safetyNotes),
        permissionRequired: formValues.permissionRequired,
        permissionNote: optionalText(formValues.permissionNote),
        lastVerifiedAt: formValues.lastVerifiedAt
          ? new Date(`${formValues.lastVerifiedAt}T00:00:00.000Z`).toISOString()
          : null,
        categoryId: formValues.categoryId,
        images: imagePayload(gallery),
      };
      try {
        let id = destination?.id ?? createdId;
        if (id) {
          const body: UpdateDestinationBody = { ...common, slug: slug.trim() };
          await updateMutation.mutateAsync({ id, body });
        } else {
          const body: CreateDestinationBody = common;
          const result = await createMutation.mutateAsync(body);
          id = result.data.id;
          setCreatedId(id);
          setPersistedStatus("DRAFT");
        }
        if (savingStatus !== persistedStatus) {
          await setStatusMutation.mutateAsync({ destinationId: id, status: savingStatus });
          setPersistedStatus(savingStatus);
          if (savingStatus !== "PUBLISHED") setPersistedFeatured(false);
        }
        const nextFeatured = savingStatus === "PUBLISHED" && formValues.isFeatured;
        if (savingStatus === "PUBLISHED" && nextFeatured !== persistedFeatured) {
          await setFeaturedMutation.mutateAsync({ id, body: { isFeatured: nextFeatured } });
          setPersistedFeatured(nextFeatured);
        }
        form.reset({ ...value, isFeatured: nextFeatured });
        setSavedGallery(gallery);
        setUnsavedChanges(false);
        router.push("/admin/destinations");
      } catch (error) {
        setServerError(error instanceof ApiError ? error.message : messages.admin.saveError);
      }
    },
  });

  const updateGallery = (index: number, patch: Partial<GalleryImage>) => {
    setGallery((current) => current.map((image, currentIndex) =>
      currentIndex === index ? { ...image, ...patch } : image,
    ));
  };
  const removeGallery = (index: number) => setGallery((current) => current.filter((_, currentIndex) => currentIndex !== index));
  const moveGallery = (index: number, direction: -1 | 1) => {
    setGallery((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const renderTextField = (name: TextFieldName, label: string, options: {
    type?: string;
    maxLength?: number;
    step?: string;
    readOnly?: boolean;
  } = {}) => (
    <form.Field name={name}>{(field) => {
      const errors = validationMessages(field.state.meta.errors);
      return <div className="admin-field">
        <label htmlFor={`admin-${name}`}>{label}</label>
        <input
          id={`admin-${name}`}
          type={options.type ?? "text"}
          value={field.state.value}
          maxLength={options.maxLength}
          step={options.step}
          readOnly={options.readOnly}
          disabled={options.readOnly}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.currentTarget.value)}
        />
        {options.readOnly && !field.state.value && <span className="admin-hint">{messages.admin.slugGenerated}</span>}
        {errors.map((error) => <span className="admin-field-error" key={error}>{error}</span>)}
      </div>;
    }}</form.Field>
  );
  const renderNumberField = (name: NumberFieldName, label: string, min: number, step: number | string) => (
    <form.Field name={name}>{(field) => {
      const errors = validationMessages(field.state.meta.errors);
      return <div className="admin-field">
        <label htmlFor={`admin-${name}`}>{label}</label>
        <input
          id={`admin-${name}`}
          type="number"
          value={Number.isNaN(field.state.value) ? "" : field.state.value}
          min={min}
          step={step}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.currentTarget.valueAsNumber)}
        />
        {errors.map((error) => <span className="admin-field-error" key={error}>{error}</span>)}
      </div>;
    }}</form.Field>
  );
  const renderTextArea = (name: TextAreaFieldName, label: string, rows: number) => (
    <form.Field name={name}>{(field) => {
      const errors = validationMessages(field.state.meta.errors);
      return <div className="admin-field admin-field-full">
        <label htmlFor={`admin-${name}`}>{label}</label>
        <textarea id={`admin-${name}`} rows={rows} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.currentTarget.value)} />
        {errors.map((error) => <span className="admin-field-error" key={error}>{error}</span>)}
      </div>;
    }}</form.Field>
  );

  return (
    <section className="admin-page">
      <form className="admin-editor" noValidate onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}>
        <header className="admin-page-header admin-page-heading-row">
          <div>
            <p className="admin-eyebrow">{messages.admin.title}</p>
            <h1>{destination ? messages.admin.destinationFormEdit : messages.admin.destinationFormNew}</h1>
          </div>
          <Link className="button button-outline" href="/admin/destinations">{messages.admin.cancel}</Link>
        </header>
        {serverError && <p className="admin-alert" role="alert">{serverError}</p>}
        <form.Subscribe selector={(state) => state.isDirty}>
          {(dirty) => <UnsavedChangeTracker dirty={dirty || galleryChanged(savedGallery, gallery)} />}
        </form.Subscribe>

        <section className="admin-form-section">
          <h2>{messages.admin.destinationSectionBasic}</h2>
          <div className="admin-form-grid">
            {renderTextField("name", messages.admin.name, { maxLength: 160 })}
            {destination && renderTextField("slug", messages.admin.slug, { readOnly: true })}
            {renderTextField("division", messages.admin.divisionLabel, { maxLength: 100 })}
            {renderTextField("district", messages.admin.district, { maxLength: 100 })}
            <form.Field name="categoryId">{(field) => <div className="admin-field">
              <label htmlFor="admin-category">{messages.admin.category}</label>
              <select id="admin-category" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.currentTarget.value)}>
                <option value="">{messages.destinationsPage.categoryAny}</option>
                {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
              </select>
              <FieldErrors errors={field.state.meta.errors} />
            </div>}</form.Field>
            <form.Field name="difficulty">{(field) => <div className="admin-field">
              <label htmlFor="admin-difficulty">{messages.admin.difficultyLabel}</label>
              <select id="admin-difficulty" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => {
                const next = event.currentTarget.value;
                if (next === "EASY" || next === "MODERATE" || next === "HARD") field.handleChange(next);
              }}>
                <option value="EASY">{messages.admin.difficultyOptions.EASY}</option>
                <option value="MODERATE">{messages.admin.difficultyOptions.MODERATE}</option>
                <option value="HARD">{messages.admin.difficultyOptions.HARD}</option>
              </select>
              <FieldErrors errors={field.state.meta.errors} />
            </div>}</form.Field>
            {renderTextArea("description", messages.admin.description, 6)}
          </div>
        </section>

        <section className="admin-form-section">
          <h2>{messages.admin.destinationSectionLocation}</h2>
          <div className="admin-form-grid">
            {renderTextField("locationText", messages.admin.locationText, { maxLength: 500 })}
            {renderTextField("latitude", messages.admin.latitude, { type: "number", step: "any" })}
            {renderTextField("longitude", messages.admin.longitude, { type: "number", step: "any" })}
          </div>
        </section>

        <section className="admin-form-section">
          <h2>{messages.admin.destinationSectionTravel}</h2>
          <div className="admin-form-grid">
            {renderNumberField("estimatedCostMin", messages.admin.costMin, 0, "any")}
            {renderNumberField("estimatedCostMax", messages.admin.costMax, 0, "any")}
            {renderNumberField("recommendedDays", messages.admin.days, 1, 1)}
            {renderTextField("bestTimeToVisit", messages.admin.bestTime, { maxLength: 200 })}
            {renderTextField("lastVerifiedAt", messages.admin.lastVerifiedAt, { type: "date" })}
            {renderTextArea("activities", messages.admin.activities, 5)}
            {renderTextArea("safetyNotes", messages.admin.safety, 4)}
            <form.Field name="permissionRequired">{(field) => <label className="admin-checkbox">
              <input type="checkbox" checked={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.currentTarget.checked)} />
              <span>{messages.admin.permissionRequired}</span>
            </label>}</form.Field>
            <form.Field name="isFeatured">{(field) => <label className="admin-checkbox">
              <input type="checkbox" checked={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.currentTarget.checked)} />
              <span>{messages.admin.featured}</span>
            </label>}</form.Field>
            <p className="admin-hint">{messages.admin.featuredHint}</p>
            {renderTextArea("permissionNote", messages.admin.permissionNote, 3)}
          </div>
        </section>

        <section className="admin-form-section">
          <h2>{messages.admin.destinationSectionImages}</h2>
          <div className="admin-upload-field">
            <h3>{messages.admin.coverImage}</h3>
            <form.Subscribe selector={(state) => state.values.coverImage}>
              {(coverImage) => coverImage ? <Image className="admin-cover-preview" src={coverImage} alt={messages.admin.imagePreview(messages.admin.coverImage)} width={520} height={300} unoptimized /> : null}
            </form.Subscribe>
            <ImageUpload label={messages.admin.uploadCover} onUploaded={(url) => form.setFieldValue("coverImage", url)} />
          </div>
          <form.Subscribe selector={(state) => state.fieldMeta.coverImage?.errors ?? []}>
            {(errors) => <FieldErrors errors={errors} />}
          </form.Subscribe>
          <div className="admin-upload-field">
            <h3>{messages.admin.gallery}</h3>
            <ImageUpload multiple label={messages.admin.uploadGallery} onUploaded={(url) => setGallery((current) => [...current, { url, caption: "" }])} />
            <div className="admin-gallery-list">
              {gallery.map((image, index) => (
                <article className="admin-gallery-item" key={`${image.url}-${index}`}>
                  <Image src={image.url} alt={messages.destinationsPage.galleryImageAlt(form.state.values.name || messages.admin.destinationsTitle, image.caption || null)} width={140} height={100} unoptimized />
                  <label>
                    <span>{messages.admin.imageCaption}</span>
                    <input maxLength={300} value={image.caption} onChange={(event) => updateGallery(index, { caption: event.currentTarget.value })} />
                  </label>
                  <div className="admin-row-actions">
                    <button className="button button-outline" type="button" aria-label={messages.admin.moveImageUp} disabled={index === 0} onClick={() => moveGallery(index, -1)}>↑</button>
                    <button className="button button-outline" type="button" aria-label={messages.admin.moveImageDown} disabled={index === gallery.length - 1} onClick={() => moveGallery(index, 1)}>↓</button>
                    <button className="button button-outline" type="button" aria-label={messages.admin.removeImage} onClick={() => removeGallery(index)}>{messages.admin.removeImage}</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <div className="admin-form-actions">
          <button className="button button-outline" disabled={mutationPending} type="button" onClick={() => {
            setSavingStatus("DRAFT");
            void form.handleSubmit();
          }}>{mutationPending ? messages.admin.saving : messages.admin.saveDraft}</button>
          <button className="button button-primary" disabled={mutationPending} type="button" onClick={() => {
            setSavingStatus("PUBLISHED");
            void form.handleSubmit();
          }}>{mutationPending ? messages.admin.saving : messages.admin.saveAndPublish}</button>
        </div>
      </form>
    </section>
  );
}

function FieldErrors({ errors }: { errors: readonly unknown[] }) {
  return <>{validationMessages(errors).map((error) => <span className="admin-field-error" key={error}>{error}</span>)}</>;
}
