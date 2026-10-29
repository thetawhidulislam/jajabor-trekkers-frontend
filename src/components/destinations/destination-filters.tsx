"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { DestinationCategory, DestinationListParams } from "@/lib/api/destinations";
import { messages } from "@/messages/en";

const difficulties = ["EASY", "MODERATE", "HARD"] as const;
const sortValues = ["newest", "rating", "cost_asc", "cost_desc"] as const;

type DestinationFiltersProps = {
  categories: DestinationCategory[];
  filters: Pick<DestinationListParams, "search" | "category" | "difficulty" | "sort">;
};

function FilterFields({
  categories,
  filters,
  idPrefix,
}: DestinationFiltersProps & { idPrefix: string }) {
  return (
    <form action="/destinations" method="get" className="destination-filter-form">
      <label htmlFor={`${idPrefix}-search`}>{messages.destinationsPage.searchLabel}</label>
      <input
        id={`${idPrefix}-search`}
        type="search"
        name="search"
        maxLength={100}
        placeholder={messages.destinationsPage.searchPlaceholder}
        defaultValue={filters.search}
      />

      <label htmlFor={`${idPrefix}-category`}>{messages.destinationsPage.categoryLabel}</label>
      <select id={`${idPrefix}-category`} name="category" defaultValue={filters.category ?? ""}>
        <option value="">{messages.destinationsPage.categoryAny}</option>
        {categories.map((category) => (
          <option value={category.slug} key={category.id}>{category.name}</option>
        ))}
      </select>

      <label htmlFor={`${idPrefix}-difficulty`}>{messages.destinationsPage.difficultyLabel}</label>
      <select
        id={`${idPrefix}-difficulty`}
        name="difficulty"
        defaultValue={filters.difficulty ?? ""}
      >
        <option value="">{messages.destinationsPage.difficultyAny}</option>
        {difficulties.map((difficulty) => (
          <option value={difficulty} key={difficulty}>
            {messages.home.difficulty[difficulty]}
          </option>
        ))}
      </select>

      <label htmlFor={`${idPrefix}-sort`}>{messages.destinationsPage.sortLabel}</label>
      <select id={`${idPrefix}-sort`} name="sort" defaultValue={filters.sort ?? "newest"}>
        {sortValues.map((sort) => (
          <option value={sort} key={sort}>
            {sort === "newest"
              ? messages.destinationsPage.sortNewest
              : sort === "rating"
                ? messages.destinationsPage.sortRating
                : sort === "cost_asc"
                  ? messages.destinationsPage.sortCostLow
                  : messages.destinationsPage.sortCostHigh}
          </option>
        ))}
      </select>
      <button className="button button-primary" type="submit">
        {messages.destinationsPage.applyFilters}
      </button>
    </form>
  );
}

function makeFilterHref(
  filters: DestinationFiltersProps["filters"],
  remove: "search" | "category" | "difficulty" | "sort",
) {
  const params = new URLSearchParams();
  if (filters.search && remove !== "search") params.set("search", filters.search);
  if (filters.category && remove !== "category") params.set("category", filters.category);
  if (filters.difficulty && remove !== "difficulty") params.set("difficulty", filters.difficulty);
  if (filters.sort && remove !== "sort") params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `/destinations?${query}` : "/destinations";
}

export function DestinationFilters({ categories, filters }: DestinationFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeFilters: { key: "search" | "category" | "difficulty" | "sort"; label: string }[] = [];

  function closeSheet() {
    if (dialogRef.current?.open) dialogRef.current.close();
    setSheetOpen(false);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (sheetOpen && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    }
    if (!sheetOpen && dialog.open) dialog.close();
  }, [sheetOpen]);

  if (filters.search) {
    activeFilters.push({ key: "search", label: filters.search });
  }
  if (filters.category) {
    const category = categories.find(({ slug }) => slug === filters.category);
    activeFilters.push({
      key: "category",
      label: category?.name ?? filters.category,
    });
  }
  if (filters.difficulty) {
    activeFilters.push({
      key: "difficulty",
      label: messages.home.difficulty[filters.difficulty],
    });
  }
  if (filters.sort) {
    activeFilters.push({
      key: "sort",
      label:
        filters.sort === "newest"
          ? messages.destinationsPage.sortNewest
          : filters.sort === "rating"
            ? messages.destinationsPage.sortRating
            : filters.sort === "cost_asc"
              ? messages.destinationsPage.sortCostLow
              : messages.destinationsPage.sortCostHigh,
    });
  }

  return (
    <>
      <aside className="destination-filter-sidebar">
        <h2>{messages.destinationsPage.filtersButton}</h2>
        <FilterFields categories={categories} filters={filters} idPrefix="desktop-filter" />
      </aside>

      <div className="destination-filter-mobile">
        <button
          type="button"
          className="button button-outline"
          aria-expanded={sheetOpen}
          aria-controls="destination-filter-sheet"
          onClick={() => setSheetOpen(true)}
        >
          {messages.destinationsPage.filtersButton}
          {activeFilters.length > 0 && <span className="filter-count">{activeFilters.length}</span>}
        </button>
        <dialog
          className="destination-filter-overlay"
          id="destination-filter-sheet"
          ref={dialogRef}
          aria-labelledby="destination-filter-title"
          onClose={() => setSheetOpen(false)}
          onCancel={(event) => {
            event.preventDefault();
            closeSheet();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeSheet();
            }
          }}
          onClick={(event) => {
            if (event.target === dialogRef.current) closeSheet();
          }}
        >
          <section className="destination-filter-sheet">
            <div className="destination-filter-sheet-heading">
              <h2 id="destination-filter-title">{messages.destinationsPage.filtersButton}</h2>
              <button
                ref={closeButtonRef}
                type="button"
                className="button button-outline"
                onClick={closeSheet}
              >
                {messages.destinationsPage.closeFilters}
              </button>
            </div>
            <FilterFields categories={categories} filters={filters} idPrefix="mobile-filter" />
          </section>
        </dialog>
      </div>

      {activeFilters.length > 0 && (
        <div className="destination-active-filters" aria-label={messages.destinationsPage.activeFilters}>
          {activeFilters.map(({ key, label }) => (
            <span className="destination-filter-chip" key={key}>
              {label}
              <Link href={makeFilterHref(filters, key)} aria-label={messages.destinationsPage.removeFilter(label)}>
                <span aria-hidden="true">×</span>
              </Link>
            </span>
          ))}
          <Link className="destination-clear-filters" href="/destinations">
            {messages.destinationsPage.clearFilters}
          </Link>
        </div>
      )}
    </>
  );
}
