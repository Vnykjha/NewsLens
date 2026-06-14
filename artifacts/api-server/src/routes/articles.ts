import { Router, type IRouter } from "express";
import { GetArticlesResponse, GetArticleAnalysisResponse, AnalyzeArticleResponse, RunOcrResponse } from "@workspace/api-zod";
import { getNewsArticles, addArticleToCache } from "../services/newsService";
import { generateAnalysis, extractTextFromImage, generateMultiModelAnalysis, fetchTextFromUrl } from "../services/openRouterService";

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

router.post("/ocr", async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ error: "Missing 'image' parameter in base64 format." });
      return;
    }

    const text = await extractTextFromImage(image);
    const data = RunOcrResponse.parse({ text });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/articles/analyze", async (req, res, next) => {
  try {
    const { url, text } = req.body;
    if (!text && !url) {
      res.status(400).json({ error: "Missing both 'text' and 'url' parameters. At least one is required." });
      return;
    }

    let articleText = text || "";
    if (!articleText && url) {
      articleText = await fetchTextFromUrl(url);
    }

    const result = await generateMultiModelAnalysis(url || "", articleText);
    
    // Add the newly generated article metadata to the backend cache
    addArticleToCache(result.article);

    const data = AnalyzeArticleResponse.parse(result);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
