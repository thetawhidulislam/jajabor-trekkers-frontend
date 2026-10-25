// All user-facing text lives here so Bangla (bn.ts) can be added later without hunting through components.
export const messages = {
  app: {
    name: "Jajabor Trekkers",
    tagline: "Plan Better. Travel Safer. Explore More.",
    description:
      "Discover destinations, plan group trips, share expenses and stay prepared for every trek.",
  },
  home: {
    statusTitle: "Backend connection",
    destinationCount: (count: number) =>
      count === 1 ? "1 published destination" : `${count} published destinations`,
    noDestinations: "No published destinations yet. Publish one from the admin dashboard.",
  },
  common: {
    loading: "Loading…",
    retry: "Try again",
    genericError: "Something went wrong. Please try again.",
  },
} as const;
