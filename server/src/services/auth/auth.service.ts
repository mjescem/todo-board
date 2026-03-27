import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../../database/index.js";
import { users } from "../../database/schema/user.js";
import jwt from "jsonwebtoken";
import type { SignUpParams } from "./authSchema.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET!;

export async function signUpUser({ name, email, password }: SignUpParams) {

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser.length > 0) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, password: passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email });

  const token = jwt.sign({ userId: newUser?.id }, JWT_SECRET, {
    expiresIn: "1d",
  });

  return { user: newUser, token };
}
