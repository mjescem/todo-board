import { Router } from "express";
import { createTicketHandler, deleteTicketHandler, getTicketHandler, getTicketsHandler, reorderTicketHandler, updateTicketHandler } from "../controllers/ticket.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", getTicketsHandler);
router.get("/:id", getTicketHandler);
router.post("/", createTicketHandler);
router.patch("/:id", updateTicketHandler);
router.delete("/:id", deleteTicketHandler);
router.post("/reorder", reorderTicketHandler);

export default router;