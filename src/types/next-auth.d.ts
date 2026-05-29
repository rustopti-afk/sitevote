import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Module augmentation that exposes the custom fields our auth callbacks attach
 * (`id` and `role`) on the Session, User and JWT types so the rest of the app
 * can read them in a type-safe way.
 *
 * `role` is typed as the Prisma `Role` enum to match how the auth callbacks
 * assign it (`token.role as Role`); compare against the `Role` enum values.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
  }
}
