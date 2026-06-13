export interface Article {
  id: string;
  headline: string;
  publisher: string;
  publisherInitial: string;
  publishedAt: string;
  readingTime: number;
  category: string;
  summary: string;
  url: string;
  credibilityScore: number;
  imageColor: string;
  isBreaking?: boolean;
}

export interface CommunityNote {
  id: string;
  author: string;
  content: string;
  upvotes: number;
  timestamp: string;
  sources?: string[];
}

export interface Citation {
  id: string;
  title: string;
  publisher: string;
  url: string;
  excerpt: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  event: string;
}

export interface Perspective {
  id: string;
  headline: string;
  publisher: string;
  publisherInitial: string;
  summary: string;
  publishedAt: string;
  credibilityScore: number;
}

export const MOCK_ARTICLES: Article[] = [
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

export const TRENDING_ARTICLES = MOCK_ARTICLES.slice(0, 4);
export const LATEST_ARTICLES = MOCK_ARTICLES.slice(2);

export const MOCK_FOLDERS = [
  { id: "f1", name: "AI Regulation", count: 7, color: "#6D28D9" },
  { id: "f2", name: "Climate Change", count: 12, color: "#1A7F4B" },
  { id: "f3", name: "Geopolitics", count: 5, color: "#D97706" },
  { id: "f4", name: "Tech Industry", count: 9, color: "#1D4ED8" },
];

export const COMMUNITY_ARTICLES = [
  { ...MOCK_ARTICLES[1], upvotes: 1247, downvotes: 89, notes: 34 },
  { ...MOCK_ARTICLES[4], upvotes: 2891, downvotes: 112, notes: 67 },
  { ...MOCK_ARTICLES[2], upvotes: 834, downvotes: 203, notes: 21 },
  { ...MOCK_ARTICLES[5], upvotes: 1563, downvotes: 156, notes: 45 },
];
