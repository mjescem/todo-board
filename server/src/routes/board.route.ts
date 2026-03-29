import { Router } from "express";
import {
  createBoardHandler,
  deleteBoardHandler,
  getBoardsHandler,
  updateBoardHandler,
} from "../controllers/board.controller.js";

const router = Router();

router.get("/", getBoardsHandler);
router.post("/", createBoardHandler);
router.patch("/:id", updateBoardHandler);
router.delete("/:id", deleteBoardHandler);

export default router;
