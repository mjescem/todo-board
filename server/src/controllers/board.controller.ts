import type { Request, Response } from "express";
import * as z from "zod";
import { createBoard, deleteBoard, getBoards, updateBoard } from "../services/board/board.service.js";

export async function getBoardsHandler(req: Request, res: Response) {
  try {
    const result = await getBoards({ ownerId: req.user!.userId });
    res.status(200).json(result);
  } catch (error) {
    console.info(error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createBoardHandler(req: Request, res: Response) {
  try {
    const { title } = req.body;
    const result = await createBoard({ ownerId: req.user!.userId, title });
    res.status(201).json(result);
  } catch (error) {
    console.info(error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateBoardHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { title } = req.body;
    const result = await updateBoard({
      id,
      ownerId: req.user!.userId,
      data: { title },
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

export async function deleteBoardHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const result = await deleteBoard({ id, ownerId: req.user!.userId });
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


