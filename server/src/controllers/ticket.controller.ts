import type { Request, Response } from "express";
import * as z from "zod";
import {
  createTicket,
  deleteTicket,
  getTicket,
  getTickets,
  reorderTicket,
  updateTicket,
} from "../services/ticket/ticket.service.js";

export async function getTicketsHandler(req: Request, res: Response) {
  try {
    const categoryId = req.query.categoryId as string;
    const result = await getTickets({ categoryId, ownerId: req.user!.userId });
    res.status(200).json(result);
  } catch (error) {
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

export async function getTicketHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const result = await getTicket({ id, ownerId: req.user!.userId });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error });
      return;
    }
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createTicketHandler(req: Request, res: Response) {
  try {
    const { categoryId, title, description, isDraft, expiryDate, color } =
      req.body;
    const result = await createTicket({
      categoryId,
      ownerId: req.user!.userId,
      data: { title, description, isDraft, expiryDate, color },
    });
    res.status(201).json(result);
  } catch (error) {
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

export async function updateTicketHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { title, description, isDraft, expiryDate, color } = req.body;
    const result = await updateTicket({
      id,
      ownerId: req.user!.userId,
      data: { title, description, isDraft, expiryDate, color },
    });
    res.status(200).json(result);
  } catch (error) {
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

export async function deleteTicketHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const result = await deleteTicket({ id, ownerId: req.user!.userId });
    res.status(200).json(result);
  } catch (error) {
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

export async function reorderTicketHandler(req: Request, res: Response) {
  try {
    const { id, destinationCategoryId, newOrder } = req.body;

    const result = await reorderTicket({
      id,
      ownerId: req.user!.userId,
      destinationCategoryId,
      newOrder,
    });
    res.status(200).json(result);
  } catch (error) {
    console.info(error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error });
      return;
    }
    if (
      error instanceof Error &&
      (error.message.includes("not found") ||
        error.message.includes("Category not found"))
    ) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}