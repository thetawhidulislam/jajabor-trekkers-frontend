import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
  phone?: string;
};

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false },
        phone: { type: "string", required: false },
      },
    }),
  ],
});
