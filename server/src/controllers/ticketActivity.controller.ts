import type { Request, Response } from "express";
import * as z from "zod";
import { getTicketActivities } from "../services/ticketActivity/ticketActivity.service.js";

export async function getTicketActivitiesHandler(req: Request, res: Response) {
  try {
    const ticketId = req.params.id as string;
    const result = await getTicketActivities({
      ticketId,
      ownerId: req.user!.userId,
    });
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
