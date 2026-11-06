import type { Metadata } from "next";
import Link from "next/link";
import { messages } from "@/messages/en";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
const contactWhatsApp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.trim();
const contactAddress = process.env.NEXT_PUBLIC_CONTACT_ADDRESS?.trim();

export const metadata: Metadata = {
  title: messages.home.pages.contact.title,
  description: messages.home.pages.contact.description,
};

export default function ContactPage() {
  const hasContactDetails = Boolean(contactEmail || contactPhone || contactWhatsApp || contactAddress);
  const whatsappNumber = contactWhatsApp?.replace(/\D/g, "");
  const phoneNumber = contactPhone?.replace(/[^\d+]/g, "");

  return (
    <main className="public-info-page shell">
      <header className="public-info-heading">
        <p className="eyebrow">{messages.home.pages.contact.intro}</p>
        <h1>{messages.home.pages.contact.title}</h1>
      </header>
      {hasContactDetails ? (
        <address className="contact-details">
          {contactEmail && (
            <div>
              <h2>{messages.home.pages.contact.email}</h2>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </div>
          )}
          {contactPhone && (
            <div>
              <h2>{messages.home.pages.contact.phone}</h2>
              {phoneNumber
                ? <a href={`tel:${phoneNumber}`}>{contactPhone}</a>
                : <p>{contactPhone}</p>}
            </div>
          )}
          {contactWhatsApp && (
            <div>
              <h2>{messages.home.pages.contact.whatsapp}</h2>
              {whatsappNumber
                ? <a href={`https://wa.me/${whatsappNumber}`}>{contactWhatsApp}</a>
                : <p>{contactWhatsApp}</p>}
            </div>
          )}
          {contactAddress && (
            <div>
              <h2>{messages.home.pages.contact.address}</h2>
              <p>{contactAddress}</p>
            </div>
          )}
        </address>
      ) : (
        <p className="coming-soon-panel">{messages.home.pages.contact.empty}</p>
      )}
      <Link className="text-link" href="/">
        {messages.home.pages.contact.backHome}
      </Link>
    </main>
  );
}
