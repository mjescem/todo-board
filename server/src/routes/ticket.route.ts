import { Router } from "express";
import { createTicketHandler, deleteTicketHandler, getTicketsHandler, updateTicketHandler } from "../controllers/ticket.controller.js";

const router = Router();

router.get("/", getTicketsHandler);
router.post("/", createTicketHandler);
router.patch("/:id", updateTicketHandler);
router.delete("/:id", deleteTicketHandler);

export default router;