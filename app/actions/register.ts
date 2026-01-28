"use server";

import prisma from "@/db/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
type RegisterState = { error: string };
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(
     prevState: RegisterState,
    formData: FormData): Promise<RegisterState>  {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
    const name = formData.get("name") as string;
  if (!email || !password) {
    return { error: "email and password are required" };
  }
  const parsedData = userSchema.safeParse({ name, email, password });
  if (!parsedData.success) {
    return { error: "Invalid credentials format" };
  }
    try {
        const existingUser = await prisma.user.findUnique({
            where:{email:parsedData.data.email}
        })
        if (existingUser) {
            return {error:"Already existing user"}
        }
        const hashedPassword = await bcrypt.hash(parsedData.data.password,12);
        await prisma.user.create({
            data: {
                name: parsedData.data.name,
                email: parsedData.data.email,
                password: hashedPassword,
                role: 'COLLECTOR'
            }
        })
       return ({error:""})
    } catch (e) {
        console.log(e)
        return {error:"Error occurred"}
    }
}
