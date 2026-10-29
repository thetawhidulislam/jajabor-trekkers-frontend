import Link from "next/link";
import { messages } from "@/messages/en";

export default function NotFound() {
  return (
    <main className="shell destination-not-found">
      <h1>{messages.destinationsPage.notFoundTitle}</h1>
      <p>{messages.destinationsPage.notFoundDescription}</p>
      <Link className="button button-primary" href="/destinations">
        {messages.destinationsPage.detailBack}
      </Link>
    </main>
  );
}
