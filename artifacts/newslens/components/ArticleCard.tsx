import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Article } from "@/lib/mockData";

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
}

export function ArticleCard({ article, compact = false }: ArticleCardProps) {
  const colors = useColors();
  const { isArticleSaved, saveArticle, unsaveArticle, folders, addToHistory } = useApp();
  const saved = isArticleSaved(article.id);
  const [showFolderModal, setShowFolderModal] = useState(false);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (saved) {
      unsaveArticle(article.id);
    } else {
      setShowFolderModal(true);
    }
  };

  const handleSaveToFolder = (folderId: string) => {
    saveArticle(article, folderId);
    setShowFolderModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAnalyze = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToHistory(article);
    router.push(`/analysis/${article.id}`);
  };

  const credColor =
    article.credibilityScore >= 80
      ? colors.credibilityHigh
      : article.credibilityScore >= 60
      ? colors.credibilityMedium
      : colors.credibilityLow;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleAnalyze}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.header}>
          <View style={[styles.publisherBadge, { backgroundColor: article.imageColor + "18" }]}>
            <View style={[styles.publisherDot, { backgroundColor: article.imageColor }]} />
            <Text style={[styles.publisher, { color: article.imageColor }]} numberOfLines={1}>
              {article.publisher}
            </Text>
          </View>
          <View style={styles.meta}>
            {article.isBreaking && (
              <View style={[styles.breakingBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.breakingText, { color: colors.accentForeground }]}>BREAKING</Text>
              </View>
            )}
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{article.publishedAt}</Text>
          </View>
        </View>

        <Text style={[styles.headline, { color: colors.foreground }]} numberOfLines={compact ? 2 : 3}>
          {article.headline}
        </Text>

        {!compact && (
          <Text style={[styles.summary, { color: colors.mutedForeground }]} numberOfLines={2}>
            {article.summary}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={[styles.credScore, { borderColor: credColor }]}>
              <Text style={[styles.credNumber, { color: credColor }]}>{article.credibilityScore}</Text>
            </View>
            <Text style={[styles.footerMeta, { color: colors.mutedForeground }]}>
              {article.readingTime} min read
            </Text>
            <View style={[styles.categoryPill, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>{article.category}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleSave} style={styles.iconBtn} hitSlop={8}>
              <Feather name={saved ? "bookmark" : "bookmark"} size={18} color={saved ? colors.accent : colors.mutedForeground} solid={saved} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAnalyze} style={[styles.analyzeBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
              <Feather name="zap" size={13} color={colors.primaryForeground} />
              <Text style={[styles.analyzeBtnText, { color: colors.primaryForeground }]}>Analyze</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <Modal visible={showFolderModal} transparent animationType="slide" onRequestClose={() => setShowFolderModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowFolderModal(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Save to Folder</Text>
            {folders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                style={[styles.folderRow, { borderBottomColor: colors.border }]}
                onPress={() => handleSaveToFolder(folder.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.folderIcon, { backgroundColor: folder.color + "20" }]}>
                  <Feather name="folder" size={16} color={folder.color} />
                </View>
                <Text style={[styles.folderName, { color: colors.foreground }]}>{folder.name}</Text>
                <Text style={[styles.folderCount, { color: colors.mutedForeground }]}>{folder.count}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.folderRow, { borderBottomColor: "transparent" }]}
              onPress={() => {
                setShowFolderModal(false);
                Alert.alert("New Folder", "Feature available in the Saved tab.");
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.folderIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="plus" size={16} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.folderName, { color: colors.mutedForeground }]}>New Folder</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  publisherBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    maxWidth: "55%",
  },
  publisherDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  publisher: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  breakingBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  breakingText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  headline: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  summary: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  credScore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  credNumber: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  footerMeta: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  categoryPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  analyzeBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingBottom: 34,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  folderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  folderIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  folderName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  folderCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
