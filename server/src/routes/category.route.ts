import { Router } from "express";
import { createCategoryHandler, deleteCategoryHandler, getCategoriesHandler, updateCategoryHandler } from "../controllers/category.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", getCategoriesHandler);
router.post("/", createCategoryHandler);
router.patch("/:id", updateCategoryHandler);
router.delete("/:id", deleteCategoryHandler);

export default router;