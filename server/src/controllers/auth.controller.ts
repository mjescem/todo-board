import type { Request, Response } from "express";
import * as z from "zod";
import { signUpUser } from "../services/auth/auth.service.js";
import { SignUpSchema } from "../services/auth/authSchema.js";

export async function signUp(req: Request, res: Response) {
  try {
    const validatedData = SignUpSchema.parse(req.body);
    const result = await signUpUser(validatedData);
    res.status(201).json(result);
  } catch (error: unknown) {
    console.info(error);
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Validation failed", details: error });
      return;
    }
    if (error instanceof Error && error.message === "User already exists") {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
