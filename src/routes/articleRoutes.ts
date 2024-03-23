import { Router } from 'express';
import { createArticle, deleteArticle, getArticle, getArticles, updateArticle } from '../controllers/articleController';

const router = Router();

router.get("/", getArticles);
router.get("/:id", getArticle);
router.post("/create", createArticle);
router.put("/edit/:id", updateArticle);
router.delete("/remove/:id", deleteArticle)

export default router; 