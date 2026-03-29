import { Router } from "express";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategoriesHandler,
  updateCategoryHandler,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", getCategoriesHandler);
router.post("/", createCategoryHandler);
router.patch("/:id", updateCategoryHandler);
router.delete("/:id", deleteCategoryHandler);

export default router;
