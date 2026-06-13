import { Router, type IRouter } from "express";
import { GetArticlesResponse } from "@workspace/api-zod";
import { getNewsArticles } from "../services/newsService";

const router: IRouter = Router();

router.get("/articles", async (_req, res, next) => {
  try {
    const articles = await getNewsArticles();
    const data = GetArticlesResponse.parse(articles);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
