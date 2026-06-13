import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArticleCard } from "@/components/ArticleCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function SavedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { folders, savedArticles, createFolder, deleteFolder } = useApp();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;

  const articlesInFolder = selectedFolderId
    ? savedArticles.filter((e) => e.folderId === selectedFolderId).map((e) => e.article)
    : [];

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName("");
    setShowNewFolder(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    Alert.alert(
      `Delete "${folderName}"?`,
      "This will remove the folder and all saved articles in it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteFolder(folderId);
            if (selectedFolderId === folderId) setSelectedFolderId(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  if (selectedFolderId) {
    const folder = folders.find((f) => f.id === selectedFolderId);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedFolderId(null)}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={[styles.folderDot, { backgroundColor: folder?.color }]} />
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>{folder?.name}</Text>
          </View>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>{articlesInFolder.length}</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
        >
          {articlesInFolder.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="bookmark" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing saved here yet</Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                Tap the bookmark icon on any article to save it to this folder
              </Text>
            </View>
          ) : (
            articlesInFolder.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Saved</Text>
        <TouchableOpacity
          style={[styles.newFolderBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowNewFolder(true)}
        >
          <Feather name="plus" size={16} color={colors.primaryForeground} />
          <Text style={[styles.newFolderBtnText, { color: colors.primaryForeground }]}>New Folder</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
      >
        <Text style={[styles.totalSaved, { color: colors.mutedForeground }]}>
          {savedArticles.length} article{savedArticles.length !== 1 ? "s" : ""} saved
        </Text>

        {folders.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="folder" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No folders yet</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Create folders to organize your saved articles by topic</Text>
          </View>
        ) : (
          <View style={styles.folderGrid}>
            {folders.map((folder) => {
              const articles = savedArticles.filter((e) => e.folderId === folder.id);
              return (
                <TouchableOpacity
                  key={folder.id}
                  style={[styles.folderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedFolderId(folder.id);
                  }}
                  onLongPress={() => handleDeleteFolder(folder.id, folder.name)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.folderIconBox, { backgroundColor: folder.color + "18" }]}>
                    <Feather name="folder" size={24} color={folder.color} />
                  </View>
                  <Text style={[styles.folderName, { color: colors.foreground }]} numberOfLines={2}>
                    {folder.name}
                  </Text>
                  <Text style={[styles.folderCount, { color: colors.mutedForeground }]}>
                    {articles.length} article{articles.length !== 1 ? "s" : ""}
                  </Text>
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} style={styles.folderArrow} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>Long press a folder to delete it</Text>
      </ScrollView>

      <Modal visible={showNewFolder} transparent animationType="slide" onRequestClose={() => setShowNewFolder(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowNewFolder(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>New Folder</Text>
            <TextInput
              style={[styles.folderInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              placeholder="Folder name (e.g. AI Regulation)"
              placeholderTextColor={colors.mutedForeground}
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateFolder}
            />
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: newFolderName.trim() ? colors.primary : colors.secondary }]}
              onPress={handleCreateFolder}
              disabled={!newFolderName.trim()}
            >
              <Text style={[styles.createBtnText, { color: newFolderName.trim() ? colors.primaryForeground : colors.mutedForeground }]}>
                Create Folder
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  folderDot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  count: { fontSize: 14, fontFamily: "Inter_400Regular" },
  newFolderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  newFolderBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  scrollContent: { padding: 16 },
  totalSaved: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  folderGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  folderCard: {
    width: "47%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    position: "relative",
  },
  folderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  folderName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  folderCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  folderArrow: { position: "absolute", bottom: 14, right: 12 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  emptyBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260 },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 16 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, padding: 20, paddingBottom: 40, gap: 16 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center" },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  folderInput: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  createBtn: { padding: 14, borderRadius: 10, alignItems: "center" },
  createBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
