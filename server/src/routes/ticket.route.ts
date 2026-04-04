import { Router } from "express";
import { createTicketHandler, deleteTicketHandler, getTicketHandler, getTicketsHandler, getUpcomingTicketsHandler, reorderTicketHandler, updateTicketHandler } from "../controllers/ticket.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { getTicketActivitiesHandler } from "../controllers/ticketActivity.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getTicketsHandler);
router.get("/upcoming", getUpcomingTicketsHandler);
router.get("/:id", getTicketHandler);
router.post("/", createTicketHandler);
router.patch("/:id", updateTicketHandler);
router.delete("/:id", deleteTicketHandler);
router.post("/reorder", reorderTicketHandler);
router.get("/:id/activities", getTicketActivitiesHandler);

export default router;