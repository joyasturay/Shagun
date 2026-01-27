import prisma from "@/db/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const verifyCredentials = async (credentials: unknown) => {
  const parsedCredentials = loginSchema.safeParse(credentials);
  if (!parsedCredentials.success) {
    return null;
  }
  const { email, password } = parsedCredentials.data;
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!user || !user.password) {
    throw new Error("User not found");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
};
