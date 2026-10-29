import Link from "next/link";
import { AlertCircle, Mountain } from "lucide-react";
import { DestinationCard } from "@/components/home/homepage";
import { DestinationFilters } from "@/components/destinations/destination-filters";
import { DestinationRetryButton } from "@/components/destinations/destination-retry-button";
import { listDestinations, type DestinationListParams } from "@/lib/api/destinations";
import { getCachedCategories } from "@/lib/api/public-destinations";
import { ApiError } from "@/lib/api/client";
import { messages } from "@/messages/en";

type SearchParams = Record<string, string | string[] | undefined>;

const difficulties = ["EASY", "MODERATE", "HARD"] as const;
const sortValues = ["newest", "rating", "cost_asc", "cost_desc"] as const;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function parseFilters(params: SearchParams): DestinationListParams {
  const search = firstValue(params.search)?.trim().slice(0, 100);
  const rawCategory = firstValue(params.category)?.trim();
  const rawDifficulty = firstValue(params.difficulty);
  const rawSort = firstValue(params.sort);
  const difficulty = difficulties.find((value) => value === rawDifficulty);
  const sort = sortValues.find((value) => value === rawSort);

  return {
    page: parsePage(firstValue(params.page)),
    limit: 9,
    ...(search ? { search } : {}),
    ...(rawCategory ? { category: rawCategory } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(sort ? { sort } : {}),
  };
}

function destinationHref(params: DestinationListParams, page: number) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.difficulty) query.set("difficulty", params.difficulty);
  if (params.sort) query.set("sort", params.sort);
  query.set("page", String(page));
  return `/destinations?${query.toString()}`;
}

function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  return [...pages].filter((value) => value > 0 && value <= totalPages).sort((a, b) => a - b);
}

function Pagination({
  params,
  page,
  totalPages,
}: {
  params: DestinationListParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav className="destination-pagination" aria-label={messages.destinationsPage.paginationLabel}>
      {page > 1 ? (
        <Link className="button button-outline" href={destinationHref(params, page - 1)}>
          {messages.destinationsPage.previousPage}
        </Link>
      ) : (
        <span className="button button-outline is-disabled" aria-disabled="true">
          {messages.destinationsPage.previousPage}
        </span>
      )}
      <div className="destination-pagination-pages">
        {visiblePages.map((number, index) => (
          <span className="destination-pagination-item" key={number}>
            {index > 0 && number - visiblePages[index - 1] > 1 && <span aria-hidden="true">…</span>}
            <Link
              href={destinationHref(params, number)}
              aria-current={page === number ? "page" : undefined}
              aria-label={messages.destinationsPage.pageLabel(number)}
              className={page === number ? "is-current" : ""}
            >
              {number}
            </Link>
          </span>
        ))}
      </div>
      {page < totalPages ? (
        <Link className="button button-outline" href={destinationHref(params, page + 1)}>
          {messages.destinationsPage.nextPage}
        </Link>
      ) : (
        <span className="button button-outline is-disabled" aria-disabled="true">
          {messages.destinationsPage.nextPage}
        </span>
      )}
    </nav>
  );
}

export function DestinationListSkeleton() {
  return (
    <div className="shell destination-list-layout" aria-busy="true">
      <div className="destination-filter-skeleton" />
      <div>
        <p className="destination-list-loading">{messages.destinationsPage.loading}</p>
        <div className="destination-grid destination-page-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="destination-skeleton" key={index}>
              <div className="skeleton skeleton-image" />
              <div className="skeleton-lines">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line skeleton-short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function DestinationListResults({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const rawParams = await searchParams;
  const filters = parseFilters(rawParams);
  let outcome:
    | {
        success: true;
        result: Awaited<ReturnType<typeof listDestinations>>;
        categories: Awaited<ReturnType<typeof getCachedCategories>>;
      }
    | { success: false; message: string };

  try {
    const [result, categories] = await Promise.all([
      listDestinations(filters),
      getCachedCategories(),
    ]);
    outcome = { success: true, result, categories };
  } catch (error) {
    outcome = {
      success: false,
      message: error instanceof ApiError ? error.message : messages.common.genericError,
    };
  }

  if (!outcome.success) {
    return (
      <div className="shell data-state destination-load-error" role="alert">
        <span className="state-icon"><AlertCircle size={23} /></span>
        <div>
          <h2>{messages.destinationsPage.errorTitle}</h2>
          <p>{outcome.message}</p>
        </div>
        <DestinationRetryButton />
      </div>
    );
  }

  const { result, categories } = outcome;
  return (
    <div className="shell destination-list-layout">
      <div className="destination-filter-column">
        <DestinationFilters
          categories={categories.data}
          filters={{
            search: filters.search,
            category: filters.category,
            difficulty: filters.difficulty,
            sort: filters.sort,
          }}
        />
      </div>
      <section className="destination-results" aria-label={messages.destinationsPage.listTitle}>
        <p className="destination-result-count">
          {messages.destinationsPage.resultCount(result.meta?.total ?? result.data.length)}
        </p>
        {result.data.length === 0 ? (
          <div className="data-state destination-empty-state">
            <span className="state-icon"><Mountain size={23} /></span>
            <div>
              <h2>{messages.destinationsPage.emptyTitle}</h2>
              <p>{messages.destinationsPage.emptyDescription}</p>
            </div>
            <Link href="/destinations" className="button button-outline">
              {messages.destinationsPage.clearFilters}
            </Link>
          </div>
        ) : (
          <>
            <div className="destination-grid destination-page-grid">
              {result.data.map((destination, index) => (
                <DestinationCard destination={destination} index={index} key={destination.id} />
              ))}
            </div>
            {result.meta && (
              <Pagination
                params={filters}
                page={result.meta.page}
                totalPages={result.meta.totalPages}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
