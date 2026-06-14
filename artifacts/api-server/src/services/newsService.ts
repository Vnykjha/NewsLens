import { Article } from "@workspace/api-zod";

const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    headline: "Federal Reserve Signals Possible Rate Cut as Inflation Eases Toward 2% Target",
    publisher: "The Financial Times",
    publisherInitial: "FT",
    publishedAt: "2 hours ago",
    readingTime: 6,
    category: "Business",
    summary: "Fed Chair Jerome Powell hinted at potential interest rate reductions as consumer price index data shows inflation moderating closer to the central bank's long-term target.",
    url: "https://ft.com/article/fed-rate-cut",
    credibilityScore: 91,
    imageColor: "#1D4ED8",
  },
  {
    id: "2",
    headline: "AI Regulation Framework Advances in Senate: What the Bill Actually Says",
    publisher: "MIT Technology Review",
    publisherInitial: "MT",
    publishedAt: "4 hours ago",
    readingTime: 8,
    category: "Technology",
    summary: "A bipartisan bill targeting large AI model training runs cleared the Senate Commerce Committee, requiring transparency reports and safety testing before deployment.",
    url: "https://technologyreview.com/ai-regulation",
    credibilityScore: 88,
    imageColor: "#6D28D9",
    isBreaking: true,
  },
  {
    id: "3",
    headline: "Climate Summit Ends With Historic Carbon Pledge — But Critics Question Enforcement",
    publisher: "The Guardian",
    publisherInitial: "GU",
    publishedAt: "6 hours ago",
    readingTime: 7,
    category: "Science",
    summary: "140 nations signed the Geneva Carbon Accord promising net-zero emissions by 2045, but environmental groups warn the agreement lacks binding enforcement mechanisms.",
    url: "https://guardian.com/climate-summit",
    credibilityScore: 83,
    imageColor: "#1A7F4B",
  },
  {
    id: "4",
    headline: "Apple Vision Pro 2 Leaks Suggest Major Weight Reduction and Standalone Capability",
    publisher: "Bloomberg",
    publisherInitial: "BL",
    publishedAt: "8 hours ago",
    readingTime: 4,
    category: "Technology",
    summary: "Supply chain sources point to a significantly lighter second-generation headset with an upgraded chip that can handle heavy compute tasks without a companion iPhone.",
    url: "https://bloomberg.com/apple-vision",
    credibilityScore: 72,
    imageColor: "#0D0D0D",
  },
  {
    id: "5",
    headline: "WHO Declares New Mpox Strain a Global Health Emergency",
    publisher: "Reuters",
    publisherInitial: "RE",
    publishedAt: "1 hour ago",
    readingTime: 5,
    category: "Science",
    summary: "The World Health Organization activated its highest alert level after a novel mpox variant was detected across 23 countries, prompting urgent calls for vaccine distribution.",
    url: "https://reuters.com/who-mpox",
    credibilityScore: 94,
    imageColor: "#C41E3A",
    isBreaking: true,
  },
  {
    id: "6",
    headline: "Gaza Ceasefire Talks Resume in Cairo; Key Sticking Points Remain Unresolved",
    publisher: "Associated Press",
    publisherInitial: "AP",
    publishedAt: "3 hours ago",
    readingTime: 6,
    category: "Politics",
    summary: "Egyptian-brokered negotiations entered a new phase with Qatar as mediator, though disagreements over hostage release sequencing and long-term governance continue.",
    url: "https://apnews.com/gaza-ceasefire",
    credibilityScore: 89,
    imageColor: "#D97706",
  },
  {
    id: "7",
    headline: "Electric Vehicle Sales Plateau as Charging Infrastructure Gaps Persist",
    publisher: "Wall Street Journal",
    publisherInitial: "WS",
    publishedAt: "5 hours ago",
    readingTime: 5,
    category: "Business",
    summary: "EV adoption growth slowed for the third consecutive quarter in the US, with surveys pointing to range anxiety and the uneven rollout of fast-charging stations as top concerns.",
    url: "https://wsj.com/ev-sales",
    credibilityScore: 86,
    imageColor: "#0EA5E9",
  },
  {
    id: "8",
    headline: "India's Space Agency Successfully Tests Reusable Launch Vehicle in Third Trial",
    publisher: "The Hindu",
    publisherInitial: "TH",
    publishedAt: "10 hours ago",
    readingTime: 4,
    category: "Science",
    summary: "ISRO's RLV-TD successfully landed autonomously on a simulated runway strip, clearing a major milestone toward a fully reusable domestic launch system expected by 2028.",
    url: "https://thehindu.com/isro-rlv",
    credibilityScore: 90,
    imageColor: "#FF6B00",
  },
  {
    id: "9",
    headline: "Formula 1: Hamilton Secures Dramatic Victory at Silverstone Grand Prix",
    publisher: "BBC Sport",
    publisherInitial: "BB",
    publishedAt: "1 day ago",
    readingTime: 5,
    category: "Sports",
    summary: "Lewis Hamilton held off a late charge to win his home Grand Prix at Silverstone, marking a historic ninth victory at the circuit.",
    url: "https://bbc.co.uk/sport/f1",
    credibilityScore: 92,
    imageColor: "#FF6B00",
  },
  {
    id: "10",
    headline: "NBA Finals: Celtics Clinch Record-Breaking 18th Championship Title",
    publisher: "ESPN",
    publisherInitial: "ES",
    publishedAt: "2 days ago",
    readingTime: 6,
    category: "Sports",
    summary: "The Boston Celtics defeated the Dallas Mavericks to claim their 18th championship title, breaking their tie with the Lakers.",
    url: "https://espn.com/nba",
    credibilityScore: 88,
    imageColor: "#FF6B00",
  },
];

// Helper to determine category from keywords
const getCategory = (title: string, desc: string): string => {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes("sport") || text.includes("game") || text.includes("cup") || text.includes("nfl") || text.includes("nba") || text.includes("olympic") || text.includes("football") || text.includes("soccer") || text.includes("basketball") || text.includes("baseball")) return "Sports";
  if (text.includes("science") || text.includes("space") || text.includes("nasa") || text.includes("health") || text.includes("climate") || text.includes("carbon") || text.includes("temp") || text.includes("medical") || text.includes("who") || text.includes("virus")) return "Science";
  if (text.includes("tech") || text.includes("ai") || text.includes("apple") || text.includes("google") || text.includes("microsoft") || text.includes("app") || text.includes("device") || text.includes("software") || text.includes("computer") || text.includes("silicon")) return "Technology";
  if (text.includes("business") || text.includes("rate") || text.includes("fed") || text.includes("market") || text.includes("stock") || text.includes("economy") || text.includes("finance") || text.includes("dollar") || text.includes("inflation")) return "Business";
  if (text.includes("politic") || text.includes("senate") || text.includes("court") || text.includes("bill") || text.includes("president") || text.includes("election") || text.includes("governm") || text.includes("congress") || text.includes("war") || text.includes("ceasefire")) return "Politics";
  return "General";
};

// Helper to calculate reading time
const getReadingTime = (content: string): number => {
  const words = content.trim().split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
};

// Helper to get credibility score
const getCredibilityScore = (publisher: string): number => {
  const pub = publisher.toLowerCase();
  if (pub.includes("reuters") || pub.includes("associated press") || pub.includes("ap news") || pub.includes("new york times") || pub.includes("financial times") || pub.includes("bloomberg") || pub.includes("wall street journal") || pub.includes("wsj") || pub.includes("nature")) {
    return Math.floor(Math.random() * 6) + 90; // 90-95
  }
  if (pub.includes("cnn") || pub.includes("bbc") || pub.includes("guardian") || pub.includes("washington post")) {
    return Math.floor(Math.random() * 6) + 83; // 83-88
  }
  return Math.floor(Math.random() * 16) + 70; // 70-85
};

// Helper to get publisher initials
const getPublisherInitials = (publisher: string): string => {
  const words = publisher.replace(/^(the|a|an)\s+/i, "").split(/\s+/);
  if (words.length >= 2 && words[0][0] && words[1][0]) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return publisher.slice(0, 2).toUpperCase();
};

// Helper to calculate relative time
const getRelativeTime = (publishedAt: string): string => {
  const diffMs = Date.now() - new Date(publishedAt).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) {
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMins} minutes ago`;
  }
  if (diffHrs === 1) return "1 hour ago";
  if (diffHrs < 24) return `${diffHrs} hours ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
};

// Helper to get category image color
const getCategoryImageColor = (category: string): string => {
  switch (category) {
    case "Technology": return "#6D28D9";
    case "Science": return "#1A7F4B";
    case "Business": return "#1D4ED8";
    case "Politics": return "#D97706";
    case "Sports": return "#FF6B00";
    default: return "#374151";
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getCategoryImageUrl = (category: string): string => {
  switch (category) {
    case "Technology":
      return "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&auto=format&fit=crop&q=60";
    case "Science":
      return "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&auto=format&fit=crop&q=60";
    case "Business":
      return "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&auto=format&fit=crop&q=60";
    case "Politics":
      return "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=500&auto=format&fit=crop&q=60";
    case "Sports":
      return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=60";
    default:
      return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&auto=format&fit=crop&q=60";
  }
};

const getMockArticlesWithImages = (): Article[] => {
  return MOCK_ARTICLES.map((art) => ({
    ...art,
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(art.headline)}/300/200`,
  }));
};

const isLikelyEnglish = (text: string): boolean => {
  // Exclude Cyrillic, Arabic, Hebrew, Devanagari, and CJK characters
  const nonEnglishPattern = /[\u0400-\u04FF\u0500-\u052F\u0600-\u06FF\u0750-\u077F\u0900-\u097F\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/;
  return !nonEnglishPattern.test(text);
};

let lastRequestTime = 0;
const rateLimitSleep = async () => {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < 600) {
    await sleep(600 - timeSinceLast);
  }
  lastRequestTime = Date.now();
};

const fetchQueued = async (url: string, options: any) => {
  await rateLimitSleep();
  return fetch(url, options);
};

let cachedArticles: Article[] = [];
let cacheTime = 0;
let isRevalidating = false;

export async function revalidateCache(apiKey: string): Promise<void> {
  if (isRevalidating) return;
  isRevalidating = true;
  try {
    const topics = ["politics", "technology", "business", "science", "sports"];
    const fetchedArticles: Article[] = [];

    // Fetch topics sequentially to prevent rate-limit throttling and API timeouts
    for (const topic of topics) {
      console.log(`Fetching topic: ${topic}`);
      try {
        await sleep(600); // Strict rate limit delay
        const response = await fetch(
          `https://api.freenewsapi.io/v1/news?topic=${topic}&language=en`,
          {
            headers: {
              "x-api-key": apiKey,
            },
            signal: AbortSignal.timeout(45000),
          }
        );

        if (!response.ok) {
          console.warn(`Failed to fetch topic ${topic}: ${response.status}`);
          continue;
        }

        const data = (await response.json()) as any;
        if (!data || !Array.isArray(data.data)) {
          continue;
        }

        // Filter out clearly non-English character sets (Cyrillic, Arabic, Chinese, etc.)
        const valid = data.data.filter((a: any) => a.title && isLikelyEnglish(a.title));

        let category = "General";
        if (topic === "politics") category = "Politics";
        else if (topic === "technology") category = "Technology";
        else if (topic === "business") category = "Business";
        else if (topic === "science") category = "Science";
        else if (topic === "sports") category = "Sports";

        // Fetch details for all 10 articles to get real publisher images and URLs
        const topArticles = valid.slice(0, 10);
        for (let idx = 0; idx < topArticles.length; idx++) {
          const a = topArticles[idx];
          const articleId = a.uuid || `news_${topic}_${idx}`;

          if (fetchedArticles.some((art) => art.id === articleId)) {
            continue;
          }

          await sleep(600); // Strict rate limit delay

          // Default fallback is a unique high-quality picsum image seeded with the article title
          let imageUrl = `https://picsum.photos/seed/${encodeURIComponent(a.title)}/300/200`;
          let articleUrl = `https://www.google.com/search?q=${encodeURIComponent(a.title)}`;
          let summaryText = a.title;
          const publisherName = a.publisher || "Free News API";

          try {
            const detailRes = await fetch(
              `https://api.freenewsapi.io/v1/details?uuid=${a.uuid}`,
              {
                headers: {
                  "x-api-key": apiKey,
                },
                signal: AbortSignal.timeout(30000),
              }
            );
            if (detailRes.ok) {
              const detailData = (await detailRes.json()) as any;
              if (detailData && detailData.data) {
                if (detailData.data.thumbnail) imageUrl = detailData.data.thumbnail;
                if (detailData.data.original_url) articleUrl = detailData.data.original_url;
                if (detailData.data.incipit) summaryText = detailData.data.incipit;
              }
            }
          } catch (detailErr) {
            console.warn(`Failed to fetch details for article ${articleId}:`, detailErr);
          }

          fetchedArticles.push({
            id: articleId,
            headline: a.title,
            publisher: publisherName,
            publisherInitial: getPublisherInitials(publisherName),
            publishedAt: getRelativeTime(a.published_at),
            readingTime: 5,
            category,
            summary: summaryText,
            url: articleUrl,
            credibilityScore: getCredibilityScore(publisherName),
            imageColor: getCategoryImageColor(category),
            imageUrl: imageUrl,
            isBreaking: idx === 0 && topic === "politics" ? true : undefined,
          });
        }
      } catch (topicError) {
        console.warn(`Error or timeout fetching topic ${topic}:`, topicError);
      }
    }

    if (fetchedArticles.length > 0) {
      // Blend fetched articles with mock data to ensure all categories have at least 3 articles
      const categories = ["Politics", "Technology", "Business", "Science", "Sports"];
      categories.forEach((cat) => {
        const catArticles = fetchedArticles.filter((a) => a.category === cat);
        if (catArticles.length < 3) {
          const needed = 3 - catArticles.length;
          const mockCatArticles = MOCK_ARTICLES.filter((a) => a.category === cat);
          let added = 0;
          for (const mockArt of mockCatArticles) {
            if (added >= needed) break;
            if (!fetchedArticles.some((a) => a.headline === mockArt.headline)) {
              fetchedArticles.push({
                ...mockArt,
                id: `mock_${mockArt.id}`,
                imageUrl: `https://picsum.photos/seed/${encodeURIComponent(mockArt.headline)}/300/200`,
              });
              added++;
            }
          }
        }
      });

      cachedArticles = fetchedArticles;
      cacheTime = Date.now();
      console.log(`Cache updated successfully with ${cachedArticles.length} articles.`);
    }
  } finally {
    isRevalidating = false;
  }
}

export function addArticleToCache(article: Article) {
  if (!cachedArticles.some((a) => a.id === article.id)) {
    cachedArticles.unshift(article);
  }
}

export async function getNewsArticles(): Promise<Article[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey.startsWith("your_")) {
    console.log("No valid NEWS_API_KEY set, falling back to mock articles.");
    return getMockArticlesWithImages();
  }

  if (cachedArticles.length === 0) {
    console.log("First request or empty cache, fetching initial articles...");
    await revalidateCache(apiKey);
    if (cachedArticles.length === 0) {
      console.log("Failed to fetch initial articles from API, falling back to mock articles.");
      return getMockArticlesWithImages();
    }
  } else {
    const now = Date.now();
    if (now - cacheTime >= 5 * 60 * 1000) {
      console.log("Cache is stale, triggering background revalidation...");
      revalidateCache(apiKey).catch((err) =>
        console.error("Background revalidation failed:", err)
      );
    }
  }

  return cachedArticles;
}
