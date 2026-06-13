import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Pre-fetch articles to populate cache on startup
  const apiKey = process.env.NEWS_API_KEY;
  if (apiKey && !apiKey.startsWith("your_")) {
    import("./services/newsService").then(({ revalidateCache }) => {
      logger.info("Pre-fetching news articles on startup...");
      revalidateCache(apiKey)
        .then(() => {
          logger.info("Initial news articles pre-fetched and cached successfully.");
        })
        .catch((err) => {
          logger.error({ err }, "Failed to pre-fetch news articles on startup");
        });
    });
  }
});
