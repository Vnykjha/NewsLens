import { Router, type IRouter } from "express";
import { GetArticlesResponse, GetArticleAnalysisResponse } from "@workspace/api-zod";
import { getNewsArticles } from "../services/newsService";
import { generateAnalysis } from "../services/openRouterService";

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

router.get("/articles/:id/analysis", async (req, res, next) => {
  try {
    const { id } = req.params;
    const articles = await getNewsArticles();
    
    // Find the matching article
    const article = articles.find((a) => a.id === id);
    if (!article) {
      res.status(404).json({ error: `Article with ID ${id} not found.` });
      return;
    }

    // Call OpenRouter service to get/generate the analysis
    const analysis = await generateAnalysis(
      article.id,
      article.headline,
      article.publisher,
      article.publishedAt,
      article.summary,
      article.url
    );

    const data = GetArticleAnalysisResponse.parse(analysis);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
