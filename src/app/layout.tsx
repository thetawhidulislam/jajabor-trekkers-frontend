import type { Metadata } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { messages } from "@/messages/en";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: `${messages.app.name} — ${messages.app.tagline}`, template: `%s | ${messages.app.name}` },
  description: messages.app.description,
  openGraph: {
    type: "website",
    siteName: messages.app.name,
    title: `${messages.app.name} — ${messages.app.tagline}`,
    description: messages.app.description,
    images: [{ url: "/brand-mark.svg", alt: messages.app.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${messages.app.name} — ${messages.app.tagline}`,
    description: messages.app.description,
    images: ["/brand-mark.svg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
