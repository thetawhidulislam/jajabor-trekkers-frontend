import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, CalendarDays, MapPin, Mountain, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import {
  DestinationImageGallery,
  type DestinationGalleryImage,
} from "@/components/destinations/destination-image-gallery";
import { DestinationPlanCta } from "@/components/destinations/destination-plan-cta";
import { DestinationRetryButton } from "@/components/destinations/destination-retry-button";
import {
  DestinationReviews,
  DestinationReviewsSkeleton,
} from "@/components/destinations/destination-reviews";
import { DifficultyBadge } from "@/components/home/homepage";
import { ApiError } from "@/lib/api/client";
import {
  getCachedDestination,
  getPublishedDestinationSlugs,
} from "@/lib/api/public-destinations";
import { formatMoney } from "@/lib/format";
import { messages } from "@/messages/en";

type RouteParams = Promise<{ slug: string }>;
type RouteSearchParams = Promise<Record<string, string | string[] | undefined>>;
type DestinationData = NonNullable<Awaited<ReturnType<typeof getCachedDestination>>>["data"];

export async function generateStaticParams() {
  const slugs = await getPublishedDestinationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { slug } = await params;
  let result: Awaited<ReturnType<typeof getCachedDestination>>;
  try {
    result = await getCachedDestination(slug);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) notFound();
    return {
      title: messages.destinationsPage.detailErrorTitle,
      description: messages.destinationsPage.listDescription,
    };
  }
  if (!result) notFound();

  const { data: destination } = result;
  const description = destination.description?.trim() || messages.destinationsPage.listDescription;
  const coverImage =
    destination.coverImage.trim() && !destination.coverImage.includes("example.com")
      ? destination.coverImage
      : undefined;
  return {
    title: destination.name,
    description,
    openGraph: {
      title: destination.name,
      description,
      images: coverImage
        ? [{ url: coverImage, alt: messages.home.destinations.imageAlt(destination.name) }]
        : undefined,
    },
  };
}

function DestinationDetailSkeleton() {
  return (
    <div className="shell destination-detail-skeleton" aria-busy="true">
      <div className="destination-detail-image-skeleton" />
      <div className="destination-detail-content-skeleton">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-short" />
      </div>
    </div>
  );
}

function DestinationLoadError({ message }: { message: string }) {
  return (
    <div className="shell data-state destination-load-error" role="alert">
      <span className="state-icon"><Mountain size={23} /></span>
      <div>
        <h1>{messages.destinationsPage.detailErrorTitle}</h1>
        <p>{message}</p>
      </div>
      <DestinationRetryButton />
    </div>
  );
}

function DetailInfo({ destination }: { destination: DestinationData }) {
  const location = destination.locationText?.trim();
  const coordinates =
    destination.latitude !== null &&
    destination.latitude !== undefined &&
    destination.longitude !== null &&
    destination.longitude !== undefined
      ? `${destination.latitude}, ${destination.longitude}`
      : null;
  const info = [
    {
      label: messages.destinationsPage.durationLabel,
      value: messages.home.destinations.days(destination.recommendedDays),
      icon: CalendarDays,
    },
    {
      label: messages.destinationsPage.bestTimeLabel,
      value: destination.bestTimeToVisit,
      icon: Mountain,
    },
    {
      label: messages.destinationsPage.estimatedCostLabel,
      value: `${formatMoney(destination.estimatedCostMin)} – ${formatMoney(destination.estimatedCostMax)}`,
      icon: MapPin,
    },
    {
      label: messages.destinationsPage.coordinatesLabel,
      value: coordinates,
      icon: MapPin,
    },
    {
      label: messages.destinationsPage.categoryDetailLabel,
      value: destination.category?.name,
      icon: Mountain,
    },
    {
      label: messages.destinationsPage.locationLabel,
      value: location,
      icon: MapPin,
    },
  ].filter((item): item is typeof item & { value: string } =>
    typeof item.value === "string" && item.value.trim().length > 0,
  );

  if (info.length === 0) return null;

  return (
    <dl className="destination-info-grid">
      {info.map(({ label, value, icon: Icon }) => (
        <div className="destination-info-item" key={label}>
          <dt><Icon size={18} />{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

async function DestinationDetails({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: RouteSearchParams;
}) {
  const { slug } = await params;
  let result: Awaited<ReturnType<typeof getCachedDestination>>;

  try {
    result = await getCachedDestination(slug);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) notFound();
    return (
      <DestinationLoadError
        message={error instanceof ApiError ? error.message : messages.common.genericError}
      />
    );
  }
  if (!result) notFound();
  const { data: destination } = result;

  const location = [destination.district, destination.division].filter(Boolean).join(", ");
  const images: DestinationGalleryImage[] = [
    {
      src: destination.coverImage.trim() ? destination.coverImage : "/destination-fallback.svg",
      caption: null,
    },
    ...(destination.images ?? []).map((image) => ({
      src: image.url,
      caption: image.caption,
    })),
  ].filter((image) => image.src.trim().length > 0);

  return (
    <>
      <header className="destination-detail-hero">
        <Image
          className="destination-detail-cover"
          src={
            destination.coverImage.trim() && !destination.coverImage.includes("example.com")
              ? destination.coverImage
              : "/destination-fallback.svg"
          }
          alt={messages.home.destinations.imageAlt(destination.name)}
          fill
          priority
          sizes="100vw"
        />
        <div className="destination-detail-overlay" />
        <div className="shell destination-detail-heading">
          <Link className="destination-back-link" href="/destinations">
            <ArrowLeft size={17} />{messages.destinationsPage.detailBack}
          </Link>
          <div className="destination-detail-title">
            <DifficultyBadge difficulty={destination.difficulty} />
            <h1>{destination.name}</h1>
            {location && <p><MapPin size={17} />{location}</p>}
            <p className="destination-detail-rating">
              <span aria-hidden="true">★</span>
              {messages.home.destinations.reviews(destination.reviewCount)} · {destination.avgRating.toFixed(1)}
            </p>
          </div>
        </div>
      </header>

      <div className="shell destination-detail-layout">
        <div className="destination-detail-main">
          <DestinationImageGallery name={destination.name} images={images} />
          <DetailInfo destination={destination} />

          {destination.description?.trim() && (
            <section className="destination-description">
              <h2>{messages.destinationsPage.descriptionLabel}</h2>
              <p>{destination.description}</p>
            </section>
          )}

          {destination.activities && destination.activities.length > 0 && (
            <section className="destination-description">
              <h2>{messages.destinationsPage.activitiesLabel}</h2>
              <ul className="destination-detail-list">
                {destination.activities.map((activity) => <li key={activity}>{activity}</li>)}
              </ul>
            </section>
          )}

          {destination.safetyNotes?.trim() && (
            <section className="destination-description destination-safety-notes">
              <h2><ShieldCheck size={20} />{messages.destinationsPage.safetyNotesLabel}</h2>
              <p>{destination.safetyNotes}</p>
            </section>
          )}

          {destination.permissionRequired !== undefined && (
            <section className="destination-description">
              <h2>{messages.destinationsPage.permissionLabel}</h2>
              <p>
                {destination.permissionRequired
                  ? messages.destinationsPage.permissionRequired
                  : messages.destinationsPage.permissionNotRequired}
              </p>
              {destination.permissionNote?.trim() && <p>{destination.permissionNote}</p>}
            </section>
          )}
        </div>

        <aside className="destination-plan-sidebar">
          <div className="destination-plan-sticky">
            <DestinationPlanCta destinationId={destination.id} />
          </div>
        </aside>
      </div>

      <div className="shell">
        <Suspense fallback={<DestinationReviewsSkeleton />}>
          <DestinationReviews slug={slug} searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

export default function DestinationDetailPage({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: RouteSearchParams;
}) {
  return (
    <main className="destination-detail-page">
      <Suspense fallback={<DestinationDetailSkeleton />}>
        <DestinationDetails params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
