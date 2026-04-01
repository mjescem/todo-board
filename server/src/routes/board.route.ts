import { Router } from "express";
import { createBoardHandler, deleteBoardHandler, getBoardsHandler, updateBoardHandler } from "../controllers/board.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", getBoardsHandler);
router.post("/", createBoardHandler);
router.patch("/:id", updateBoardHandler);
router.delete("/:id", deleteBoardHandler);

export default router;