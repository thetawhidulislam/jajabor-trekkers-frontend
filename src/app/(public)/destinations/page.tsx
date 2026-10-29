import type { Metadata } from "next";
import { Suspense } from "react";
import {
  DestinationListResults,
  DestinationListSkeleton,
} from "@/components/destinations/destination-list-results";
import { messages } from "@/messages/en";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: messages.destinationsPage.listTitle,
  description: messages.destinationsPage.listDescription,
  openGraph: {
    title: messages.destinationsPage.listTitle,
    description: messages.destinationsPage.listDescription,
  },
};

export default function DestinationsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="destination-list-page">
      <header className="shell destination-list-heading">
        <span className="eyebrow">{messages.home.destinations.eyebrow}</span>
        <h1>{messages.destinationsPage.listTitle}</h1>
        <p>{messages.destinationsPage.listDescription}</p>
      </header>
      <Suspense fallback={<DestinationListSkeleton />}>
        <DestinationListResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
