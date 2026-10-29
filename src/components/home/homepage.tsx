"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Backpack,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Footprints,
  Mail,
  MapPin,
  Menu,
  Moon,
  Mountain,
  Phone,
  Search,
  Shirt,
  Star,
  Sun,
  TentTree,
  Trees,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { useDestinations } from "@/hooks/use-destinations";
import { ApiError } from "@/lib/api/client";
import type { DestinationCard } from "@/lib/api/destinations";
import { formatMoney } from "@/lib/format";
import { messages } from "@/messages/en";

const photos = {
  hero: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=88",
  sajek: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
  bandarban: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85",
  trail: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1000&q=85",
  galleryOne: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80",
  galleryTwo: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=800&q=80",
  galleryThree: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
  galleryFour: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
};
const destinationFallback = "/destination-fallback.svg";
const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL?.trim();
const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
const contactAddress = process.env.NEXT_PUBLIC_CONTACT_ADDRESS?.trim();
const contactPhoneHref = contactPhone
  ? `tel:${contactPhone.replace(/[^\d+]/g, "")}`
  : undefined;

const navLinks = [
  { href: "/destinations", label: messages.home.nav.destinations },
  { href: "/trips/new", label: messages.home.nav.plan },
  ...(shopUrl ? [{ href: shopUrl, label: messages.home.nav.gear, external: true }] : []),
];

const gearIcons = [Backpack, Footprints, TentTree, Shirt, Compass];
const stepIcons = [MapPin, UsersRound, Backpack];

function getThemeSnapshot(): "light" | "dark" {
  const theme = document.documentElement.dataset.theme;
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("jajabor-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("jajabor-theme-change", callback);
  };
}

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand-mark.svg"
      alt=""
      width={48}
      height={48}
      aria-hidden="true"
      className={className}
    />
  );
}

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" className={`brand${footer ? " brand-footer" : ""}`} aria-label={messages.app.name}>
      <BrandMark />
      <span>
        <strong>Jajabor</strong>
        <small>{messages.home.brandSuffix}</small>
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("jajabor-theme");
    const initialTheme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.dataset.theme = initialTheme;
    window.dispatchEvent(new Event("jajabor-theme-change"));
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("jajabor-theme", nextTheme);
    window.dispatchEvent(new Event("jajabor-theme-change"));
  }

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      aria-label={theme === "light" ? messages.home.theme.dark : messages.home.theme.light}
      title={theme === "light" ? messages.home.theme.dark : messages.home.theme.light}
      onClick={toggleTheme}
    >
      {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
    </button>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"EN" | "BN">("EN");

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <nav className="navbar shell" aria-label={messages.home.nav.label}>
        <Brand />
        <div id="mobile-navigation" className={`nav-links${menuOpen ? " nav-links-open" : ""}`}>
          {navLinks.map((link) =>
            "external" in link ? (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer" onClick={closeMenu}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} onClick={closeMenu}>
                {link.label}
              </Link>
            ),
          )}
          <div className="mobile-nav-actions">
            <button
              type="button"
              className="language-toggle"
              aria-label={messages.home.language.label}
              onClick={() => setLanguage(language === "EN" ? "BN" : "EN")}
            >
              {language === "EN" ? "বাংলা" : "English"}
            </button>
            <ThemeToggle />
          </div>
          <Link href="/trips/new" className="button button-primary nav-mobile-cta" onClick={closeMenu}>
            {messages.home.nav.plan}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="nav-tools">
          <button
            type="button"
            className="language-toggle desktop-language"
            aria-label={messages.home.language.label}
            onClick={() => setLanguage(language === "EN" ? "BN" : "EN")}
          >
            {language === "EN" ? "বাংলা" : "English"}
          </button>
          <ThemeToggle />
          <Link href="/trips/new" className="button button-primary nav-book">
            {messages.home.nav.plan}
            <ArrowUpRight size={17} />
          </Link>
          <button
            type="button"
            className="icon-button menu-toggle"
            aria-label={menuOpen ? messages.home.nav.closeMenu : messages.home.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </nav>
    </header>
  );
}

function SearchCard() {
  return (
    <form action="/destinations" method="get" className="search-card">
      <label className="search-field">
        <span className="search-icon"><MapPin size={18} /></span>
        <span className="search-label">{messages.home.search.destination}</span>
        <input
          type="search"
          name="search"
          placeholder={messages.home.search.destinationHint}
          aria-label={messages.home.search.destination}
        />
      </label>
      <label className="search-field search-date">
        <span className="search-icon"><CalendarDays size={18} /></span>
        <span className="search-label">{messages.home.search.when}</span>
        <input type="date" name="date" aria-label={messages.home.search.when} />
      </label>
      <label className="search-field search-difficulty">
        <span className="search-icon"><Mountain size={18} /></span>
        <span className="search-label">{messages.home.search.difficulty}</span>
        <select name="difficulty" defaultValue="">
          <option value="">{messages.home.search.anyLevel}</option>
          <option value="EASY">{messages.home.difficulty.EASY}</option>
          <option value="MODERATE">{messages.home.difficulty.MODERATE}</option>
          <option value="HARD">{messages.home.difficulty.HARD}</option>
        </select>
        <ChevronDown className="select-chevron" size={16} />
      </label>
      <button className="button button-primary search-submit" type="submit">
        <Search size={18} />
        <span>{messages.home.search.button}</span>
      </button>
    </form>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <Image
        src={photos.hero}
        alt={messages.home.hero.imageAlt}
        fill
        priority
        sizes="100vw"
        className="hero-image"
      />
      <div className="hero-overlay" />
      <div className="hero-contours" />
      <div className="hero-content shell">
        <motion.div
          className="hero-copy"
          initial={false}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
        >
          <span className="eyebrow eyebrow-light">
            <span className="eyebrow-dot" />
            {messages.home.hero.eyebrow}
          </span>
          <h1 id="hero-title">{messages.app.tagline}</h1>
          <p>{messages.home.hero.description}</p>
          <div className="hero-trust" aria-label={messages.home.hero.trustLabel}>
            {messages.home.hero.trust.map((item) => (
              <span key={item}><Check size={15} strokeWidth={3} />{item}</span>
            ))}
          </div>
        </motion.div>
        <div className="hero-search-wrap">
          <SearchCard />
          <p className="hero-caption"><ArrowDown size={15} />{messages.home.hero.searchCaption}</p>
        </div>
      </div>
      <div className="hero-bottom shell">
        <span><MapPin size={15} />{messages.home.hero.location}</span>
        <span>{messages.home.hero.scroll}<ArrowDownRight size={15} /></span>
      </div>
    </section>
  );
}

function StatsStrip({ total, isPending, hasError }: { total: number | null; isPending: boolean; hasError: boolean }) {
  const reduceMotion = useReducedMotion();
  const stats = [
    { value: isPending || hasError || total === null ? "—" : total.toLocaleString("en-BD"), label: messages.home.stats.destinations, icon: MapPin },
    { value: messages.home.stats.plan, label: messages.home.stats.planning, icon: UsersRound },
    { value: messages.home.stats.split, label: messages.home.stats.expenses, icon: Footprints },
    { value: messages.home.stats.share, label: messages.home.stats.packing, icon: Backpack },
  ];

  return (
    <section className="stats-section" aria-label={messages.home.stats.label}>
      <div className="stats-grid shell">
        {stats.map(({ value, label, icon: Icon }) => (
          <div className="stat-item" key={label} aria-busy={isPending && label === messages.home.stats.destinations}>
            <span className="stat-icon"><Icon size={19} /></span>
            <div>
              <motion.strong
                initial={false}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
              >
                {value}
              </motion.strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: DestinationCard["difficulty"] }) {
  return (
    <span className={`difficulty-badge difficulty-${difficulty.toLowerCase()}`}>
      <span />
      {messages.home.difficulty[difficulty]}
    </span>
  );
}

export function DestinationCard({ destination, index }: { destination: DestinationCard; index: number }) {
  const reduceMotion = useReducedMotion();
  const [imageSrc, setImageSrc] = useState(
    destination.coverImage && !destination.coverImage.includes("example.com")
      ? destination.coverImage
      : destinationFallback,
  );
  const price = formatMoney(destination.estimatedCostMin);

  return (
    <motion.article
      className="destination-card"
      initial={false}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
    >
      <Link href={`/destinations/${destination.slug}`} className="destination-image-link">
        <div className="destination-image-wrap">
          <Image
            src={imageSrc}
            alt={messages.home.destinations.imageAlt(destination.name)}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="destination-image"
            onError={() => {
              if (imageSrc !== destinationFallback) setImageSrc(destinationFallback);
            }}
          />
          <div className="image-fade" />
          <DifficultyBadge difficulty={destination.difficulty} />
          {destination.isFeatured && <span className="featured-label"><Star size={13} fill="currentColor" />{messages.home.destinations.featured}</span>}
          <span className="image-location"><MapPin size={14} />{destination.division}{destination.district ? `, ${destination.district}` : ""}</span>
        </div>
      </Link>
      <div className="destination-details">
        <div className="destination-title-row">
          <Link href={`/destinations/${destination.slug}`} className="destination-name">{destination.name}</Link>
          {destination.avgRating > 0 && (
            <span className="destination-rating"><Star size={15} fill="currentColor" />{destination.avgRating.toFixed(1)}</span>
          )}
        </div>
        <div className="destination-meta">
          <span><CalendarDays size={15} />{messages.home.destinations.days(destination.recommendedDays)}</span>
          {destination.reviewCount > 0 && <span>{messages.home.destinations.reviews(destination.reviewCount)}</span>}
        </div>
        <div className="destination-bottom">
          <p>{messages.home.destinations.from} <strong>{price}</strong><span> / {messages.home.destinations.person}</span></p>
          <Link href={`/destinations/${destination.slug}`} className="text-link">
            {messages.home.destinations.viewDetails}<ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function DestinationSkeleton() {
  return (
    <div className="destination-grid" aria-busy="true" aria-label={messages.common.loading}>
      {Array.from({ length: 3 }, (_, index) => (
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
  );
}

function FeaturedDestinations({
  destinations,
  isPending,
  error,
  onRetry,
}: {
  destinations: DestinationCard[];
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  return (
    <section id="destinations" className="section section-destinations">
      <div className="shell">
        <SectionHeading
          eyebrow={messages.home.destinations.eyebrow}
          title={messages.home.destinations.title}
          description={messages.home.destinations.description}
          action={<Link href="/destinations" className="text-link section-action">{messages.home.destinations.all}<ArrowRight size={17} /></Link>}
        />
        {isPending ? (
          <DestinationSkeleton />
        ) : error ? (
          <div className="data-state" role="alert">
            <span className="state-icon"><Compass size={23} /></span>
            <div>
              <h3>{messages.home.destinations.errorTitle}</h3>
              <p>{error instanceof ApiError ? error.message : messages.common.genericError}</p>
            </div>
            <button type="button" className="button button-outline" onClick={onRetry}>{messages.common.retry}</button>
          </div>
        ) : destinations.length === 0 ? (
          <div className="data-state">
            <span className="state-icon"><Mountain size={23} /></span>
            <div>
              <h3>{messages.home.destinations.emptyTitle}</h3>
              <p>{messages.home.destinations.emptyDescription}</p>
            </div>
            <Link href="/destinations" className="button button-outline">{messages.home.destinations.explore}</Link>
          </div>
        ) : (
          <div className="destination-grid">
            {destinations.slice(0, 6).map((destination, index) => (
              <DestinationCard key={destination.id} destination={destination} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section section-how" id="about">
      <div className="shell">
        <SectionHeading
          eyebrow={messages.home.how.eyebrow}
          title={messages.home.how.title}
          description={messages.home.how.description}
        />
        <div className="steps-grid">
          {messages.home.how.steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <motion.article
                className="step-card"
                key={step.title}
                initial={false}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="step-number">0{index + 1}</span>
                <span className="step-icon"><Icon size={24} strokeWidth={1.7} /></span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < 2 && <ArrowRight className="step-arrow" size={20} />}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GearTeaser({ href }: { href: string }) {
  return (
    <section className="section section-gear" id="gear">
      <div className="shell">
        <div className="gear-banner">
          <div className="gear-intro">
            <span className="eyebrow">{messages.home.gear.eyebrow}</span>
            <h2>{messages.home.gear.title}</h2>
            <p>{messages.home.gear.description}</p>
            <a href={href} target="_blank" rel="noreferrer" className="text-link">
              {messages.home.gear.button}<ArrowUpRight size={17} />
            </a>
          </div>
          <div className="gear-categories">
            {messages.home.gear.categories.map((category, index) => {
              const Icon = gearIcons[index];
              return (
                <div className="gear-tile" key={category}>
                  <span><Icon size={23} strokeWidth={1.7} /></span>
                  <strong>{category}</strong>
                  <ArrowUpRight className="gear-arrow" size={16} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  const galleryImages = [
    { image: photos.galleryOne, alt: messages.home.community.imageAlt[0], className: "gallery-tall" },
    { image: photos.galleryTwo, alt: messages.home.community.imageAlt[1], className: "" },
    { image: photos.galleryThree, alt: messages.home.community.imageAlt[2], className: "" },
    { image: photos.galleryFour, alt: messages.home.community.imageAlt[3], className: "gallery-tall" },
  ];

  return (
    <section className="section section-community">
      <div className="shell">
        <div className="community-heading">
          <SectionHeading
            eyebrow={messages.home.community.eyebrow}
            title={messages.home.community.title}
            description={messages.home.community.description}
          />
          <Link href="/destinations" className="text-link">{messages.home.community.follow}<ArrowUpRight size={17} /></Link>
        </div>
        <div className="community-grid">
          {galleryImages.map((photo, index) => (
            <div className={`gallery-photo ${photo.className}`} key={photo.image}>
              <Image src={photo.image} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, 25vw" />
              <span className="gallery-index">0{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="cta-section">
      <div className="cta-contours" />
      <div className="shell cta-content">
        <div>
          <span className="eyebrow eyebrow-light">{messages.home.cta.eyebrow}</span>
          <h2>{messages.home.cta.title}</h2>
          <p>{messages.home.cta.description}</p>
        </div>
        <Link href="/trips/new" className="button button-primary button-large">
          {messages.home.cta.button}<ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer className="site-footer">
      <div className={`shell footer-main${contactPhone || contactEmail || contactAddress ? "" : " footer-main-no-contact"}`}>
        <div className="footer-brand-column">
          <Brand footer />
          <p>{messages.home.footer.about}</p>
          <div className="footer-socials" aria-label={messages.home.footer.socialLabel}>
            <a href="https://www.instagram.com/" aria-label={messages.home.footer.instagram} target="_blank" rel="noreferrer">ig</a>
            <a href="https://www.facebook.com/" aria-label={messages.home.footer.facebook} target="_blank" rel="noreferrer">f</a>
            <a href="https://www.youtube.com/" aria-label={messages.home.footer.youtube} target="_blank" rel="noreferrer">▶</a>
          </div>
        </div>
        <div className="footer-link-column">
          <h3>{messages.home.footer.explore}</h3>
          <Link href="/destinations">{messages.home.nav.destinations}</Link>
          <Link href="/trips/new">{messages.home.nav.plan}</Link>
          {shopUrl && <a href={shopUrl} target="_blank" rel="noreferrer">{messages.home.nav.gear}</a>}
        </div>
        {(contactPhone || contactEmail || contactAddress) && (
          <div className="footer-contact">
            <h3>{messages.home.footer.contact}</h3>
            {contactAddress && <p><MapPin size={16} />{contactAddress}</p>}
            {contactPhone && contactPhoneHref && (
              <a href={contactPhoneHref} className="footer-contact-link">
                <Phone size={15} />{messages.home.footer.phone}: {contactPhone}
              </a>
            )}
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="footer-contact-link">
                <Mail size={15} />{messages.home.footer.email}: {contactEmail}
              </a>
            )}
          </div>
        )}
        <div className="footer-newsletter">
          <h3>{messages.home.footer.newsletter}</h3>
          <p>{messages.home.footer.newsletterDescription}</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <label className="sr-only" htmlFor="newsletter-email">{messages.home.footer.emailLabel}</label>
            <input id="newsletter-email" type="email" placeholder={messages.home.footer.emailPlaceholder} required disabled={subscribed} />
            <button type="submit" aria-label={messages.home.footer.subscribe} disabled={subscribed}>
              {subscribed ? <Check size={18} /> : <ArrowRight size={18} />}
            </button>
          </form>
          {subscribed && <p className="newsletter-success" role="status">{messages.home.footer.newsletterSuccess}</p>}
        </div>
      </div>
      <div className="footer-bottom shell">
        <span>{messages.home.footer.copyright}</span>
        <span>{messages.home.footer.madeFor}<Trees size={15} /></span>
      </div>
    </footer>
  );
}

export function QuickContact() {
  if (!contactPhoneHref) return null;

  return (
    <a href={contactPhoneHref} className="quick-contact" aria-label={messages.home.quickContact}>
      <Phone size={19} />
      <span>{messages.home.quickContact}</span>
    </a>
  );
}

export function HomePage() {
  const { data, error, isPending, refetch } = useDestinations({ limit: 6, sort: "rating" });
  const destinations = data?.data ?? [];
  const total = data?.meta?.total ?? (destinations.length < 6 ? destinations.length : null);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsStrip total={total} isPending={isPending} hasError={Boolean(error)} />
        <FeaturedDestinations
          destinations={destinations}
          isPending={isPending}
          error={error}
          onRetry={() => void refetch()}
        />
        <HowItWorks />
        {shopUrl && <GearTeaser href={shopUrl} />}
        <CommunitySection />
        <CtaSection />
      </main>
      <Footer />
      <QuickContact />
    </>
  );
}
