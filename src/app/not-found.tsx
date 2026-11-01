import Link from "next/link";
import { messages } from "@/messages/en";

export default function NotFound() {
  return (
    <main className="shell destination-not-found">
      <h1>{messages.app.notFoundTitle}</h1>
      <p>{messages.app.notFoundDescription}</p>
      <Link className="button button-primary" href="/">
        {messages.app.backHome}
      </Link>
    </main>
  );
}
