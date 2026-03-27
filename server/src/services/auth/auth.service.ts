import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../../database/index.js";
import { users } from "../../database/schema/user.js";
import jwt from "jsonwebtoken";
import type { LoginParams, SignUpParams } from "./authSchema.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET!;

export async function signUpUser({ name, email, password }: SignUpParams) {

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser.length > 0) {
    throw new Error("Email already exists");
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

export async function loginUser({email, password}: LoginParams) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

     if (!user) {
       throw new Error("Invalid credentials");
     }

     const isValid = await bcrypt.compare(password, user.password);
     if (!isValid) {
       throw new Error("Invalid credentials");
     }

     const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
       expiresIn: "1d",
     });

     return {
       user: { id: user.id, name: user.name, email: user.email },
       token,
     };
}