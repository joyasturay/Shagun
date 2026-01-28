"use server";

import { signIn } from "@/app/lib/auth";
import { AuthError } from "next-auth";
type LoginState =
  | { success: true }
  | { error: string }

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
):Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect:false,
    });

    return { success:true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    return { error: "Something went wrong" };
  }
}
