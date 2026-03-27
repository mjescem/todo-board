import type { Request, Response } from "express";
import * as z from "zod";
import { loginUser, signUpUser } from "../services/auth/auth.service.js";
import { LoginSchema, SignUpSchema } from "../services/auth/authSchema.js";

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
    if (error instanceof Error && error.message === "Email already exists") {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
    try {
         const validatedData = LoginSchema.parse(req.body);
         const result = await loginUser(validatedData);
         res.status(200).json(result);
    } catch (error: unknown) {
      console.info(error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Validation failed", details: error });
        return;
      }
      if (error instanceof Error && error.message === "Invalid credentials") {
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
}
