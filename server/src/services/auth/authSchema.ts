import * as z from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export const LoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpParams = z.infer<typeof SignUpSchema>;
export type LoginParams = z.infer<typeof LoginSchema>;
