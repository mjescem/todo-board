import type { Request, Response } from "express";
import * as z from "zod";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../services/category/category.service.js";

export async function getCategoriesHandler(req: Request, res: Response) {
  try {
    const boardId = req.query.boardId as string;
    const result = await getCategories({ boardId, ownerId: req.user!.userId });
    res.status(200).json(result);
  } catch (error) {
    console.info(error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error});
      return;
    }
    if (error instanceof Error && error.message.includes("unauthorized")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createCategoryHandler(req: Request, res: Response) {
  try {
    const { boardId, title, color } = req.body;

    const result = await createCategory({
      boardId,
      ownerId: req.user!.userId,
      title,
      color,
    });
    res.status(201).json(result);
  } catch (error) {
    console.info(error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error });
      return;
    }
    if (error instanceof Error && error.message.includes("unauthorized")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateCategoryHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { title, color } = req.body;
    const result = await updateCategory({
      id,
      ownerId: req.user!.userId,
      data: { title, color },
    });
    res.status(200).json(result);
  } catch (error) {
    console.info(error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error });
      return;
    }
    if (error instanceof Error && error.message.includes("unauthorized")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteCategoryHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const result = await deleteCategory({ id, ownerId: req.user!.userId });
    res.status(200).json(result);
  } catch (error) {
    console.info(error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error });
      return;
    }
    if (error instanceof Error && error.message.includes("unauthorized")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
