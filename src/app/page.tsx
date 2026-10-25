import { DestinationCount } from "@/components/shared/destination-count";
import { messages } from "@/messages/en";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">{messages.app.name}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{messages.app.tagline}</p>
      </header>

      <section
        aria-labelledby="status-title"
        className="space-y-3 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
      >
        <h2 id="status-title" className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {messages.home.statusTitle}
        </h2>
        <DestinationCount />
      </section>
    </main>
  );
}
