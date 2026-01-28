// app/lib/type-guards.ts
import type { AuthUser } from "./auth-types";

export function isAuthUser(user: unknown): user is AuthUser {
  return (
    typeof user === "object" &&
    user !== null &&
    "id" in user &&
    "role" in user &&
    typeof (user ).role === "string"
  );
}
