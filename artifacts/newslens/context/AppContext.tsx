import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Article, MOCK_FOLDERS } from "@/lib/mockData";

interface Folder {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface SavedEntry {
  article: Article;
  folderId: string;
  savedAt: string;
}

interface AppContextType {
  savedArticles: SavedEntry[];
  folders: Folder[];
  readingHistory: Article[];
  saveArticle: (article: Article, folderId: string) => void;
  unsaveArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
  createFolder: (name: string) => void;
  deleteFolder: (folderId: string) => void;
  addToHistory: (article: Article) => void;
  upvotedArticles: string[];
  downvotedArticles: string[];
  toggleUpvote: (articleId: string) => void;
  toggleDownvote: (articleId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  SAVED: "newslens_saved",
  FOLDERS: "newslens_folders",
  HISTORY: "newslens_history",
  UPVOTES: "newslens_upvotes",
  DOWNVOTES: "newslens_downvotes",
};

const FOLDER_COLORS = ["#6D28D9", "#1A7F4B", "#D97706", "#1D4ED8", "#C41E3A", "#0EA5E9"];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [savedArticles, setSavedArticles] = useState<SavedEntry[]>([]);
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [readingHistory, setReadingHistory] = useState<Article[]>([]);
  const [upvotedArticles, setUpvotedArticles] = useState<string[]>([]);
  const [downvotedArticles, setDownvotedArticles] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [saved, fol, hist, up, down] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SAVED),
          AsyncStorage.getItem(STORAGE_KEYS.FOLDERS),
          AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
          AsyncStorage.getItem(STORAGE_KEYS.UPVOTES),
          AsyncStorage.getItem(STORAGE_KEYS.DOWNVOTES),
        ]);
        if (saved) setSavedArticles(JSON.parse(saved));
        if (fol) setFolders(JSON.parse(fol));
        if (hist) setReadingHistory(JSON.parse(hist));
        if (up) setUpvotedArticles(JSON.parse(up));
        if (down) setDownvotedArticles(JSON.parse(down));
      } catch {}
    };
    load();
  }, []);

  const saveArticle = useCallback(async (article: Article, folderId: string) => {
    const entry: SavedEntry = { article, folderId, savedAt: new Date().toISOString() };
    setSavedArticles((prev) => {
      const next = [...prev.filter((e) => e.article.id !== article.id), entry];
      AsyncStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(next));
      return next;
    });
    setFolders((prev) => {
      const next = prev.map((f) => f.id === folderId ? { ...f, count: f.count + 1 } : f);
      AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(next));
      return next;
    });
  }, []);

  const unsaveArticle = useCallback(async (articleId: string) => {
    setSavedArticles((prev) => {
      const entry = prev.find((e) => e.article.id === articleId);
      const next = prev.filter((e) => e.article.id !== articleId);
      AsyncStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(next));
      if (entry) {
        setFolders((fPrev) => {
          const fNext = fPrev.map((f) => f.id === entry.folderId ? { ...f, count: Math.max(0, f.count - 1) } : f);
          AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(fNext));
          return fNext;
        });
      }
      return next;
    });
  }, []);

  const isArticleSaved = useCallback((articleId: string) => {
    return savedArticles.some((e) => e.article.id === articleId);
  }, [savedArticles]);

  const createFolder = useCallback(async (name: string) => {
    const newFolder: Folder = {
      id: `f${Date.now()}`,
      name,
      count: 0,
      color: FOLDER_COLORS[folders.length % FOLDER_COLORS.length],
    };
    setFolders((prev) => {
      const next = [...prev, newFolder];
      AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(next));
      return next;
    });
  }, [folders.length]);

  const deleteFolder = useCallback(async (folderId: string) => {
    setFolders((prev) => {
      const next = prev.filter((f) => f.id !== folderId);
      AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(next));
      return next;
    });
    setSavedArticles((prev) => {
      const next = prev.filter((e) => e.folderId !== folderId);
      AsyncStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(next));
      return next;
    });
  }, []);

  const addToHistory = useCallback(async (article: Article) => {
    setReadingHistory((prev) => {
      const next = [article, ...prev.filter((a) => a.id !== article.id)].slice(0, 50);
      AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleUpvote = useCallback(async (articleId: string) => {
    setUpvotedArticles((prev) => {
      const isUp = prev.includes(articleId);
      const next = isUp ? prev.filter((id) => id !== articleId) : [...prev, articleId];
      AsyncStorage.setItem(STORAGE_KEYS.UPVOTES, JSON.stringify(next));
      return next;
    });
    setDownvotedArticles((prev) => {
      const next = prev.filter((id) => id !== articleId);
      AsyncStorage.setItem(STORAGE_KEYS.DOWNVOTES, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleDownvote = useCallback(async (articleId: string) => {
    setDownvotedArticles((prev) => {
      const isDown = prev.includes(articleId);
      const next = isDown ? prev.filter((id) => id !== articleId) : [...prev, articleId];
      AsyncStorage.setItem(STORAGE_KEYS.DOWNVOTES, JSON.stringify(next));
      return next;
    });
    setUpvotedArticles((prev) => {
      const next = prev.filter((id) => id !== articleId);
      AsyncStorage.setItem(STORAGE_KEYS.UPVOTES, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      savedArticles,
      folders,
      readingHistory,
      saveArticle,
      unsaveArticle,
      isArticleSaved,
      createFolder,
      deleteFolder,
      addToHistory,
      upvotedArticles,
      downvotedArticles,
      toggleUpvote,
      toggleDownvote,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
