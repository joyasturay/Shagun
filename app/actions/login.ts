"use server";

import { signIn } from "@/app/lib/auth";
import { AuthError } from "next-auth";

export type LoginState = {
  success: boolean;
  error: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

   
    return { success: true, error: "" };
    
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Something went wrong with authentication" };
      }
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}