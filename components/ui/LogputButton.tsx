"use client";

import AnimatedButton from "@/components/ui/animated-button";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <AnimatedButton
      onClick={() =>
        signOut({
          callbackUrl: "/login", // send user to login page
        })
      }
    >
      Logout
    </AnimatedButton>
  );
}
