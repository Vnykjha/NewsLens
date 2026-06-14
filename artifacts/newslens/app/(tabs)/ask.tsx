import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { usePocketPal, Message } from "@/hooks/usePocketPal";
import { MOCK_ARTICLES, Article, Citation } from "@/lib/mockData";
import { useGetArticles } from "@workspace/api-client-react";

export default function AskScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { readingHistory } = useApp();
  const {
    apiUrl,
    isConnected,
    isChecking,
    updateApiUrl,
    checkConnection,
    sendMessage,
  } = usePocketPal();

  const { data: articles = [] } = useGetArticles();

  // Compile list of unique articles available to select
  // We prioritize active articles, then reading history, then fill with default mock articles
  const availableArticles: Article[] = [];
  const articleIds = new Set<string>();

  articles.forEach((item) => {
    if (!articleIds.has(item.id)) {
      availableArticles.push(item);
      articleIds.add(item.id);
    }
  });

  readingHistory.forEach((item) => {
    if (!articleIds.has(item.id)) {
      availableArticles.push(item);
      articleIds.add(item.id);
    }
  });

  MOCK_ARTICLES.forEach((item) => {
    if (!articleIds.has(item.id)) {
      availableArticles.push(item);
      articleIds.add(item.id);
    }
  });

  // Selected article to focus Q&A on. Undefined = general questions.
  const [selectedArticleId, setSelectedArticleId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to the NewsLens Editorial Desk. I am Qwen, your on-device research editor.\n\nSelect an article from today's briefing above to focus our discussion. Ask me about the **context**, **evidence strength**, **underlying claims**, or **conflicting perspectives** of any story. How can I assist your investigation today?",
      timestamp: new Date(),
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsUrl, setSettingsUrl] = useState(apiUrl);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Sync settings URL state when hook loaded
  useEffect(() => {
    setSettingsUrl(apiUrl);
  }, [apiUrl]);

  // Suggested questions based on selected article
  const getSuggestions = () => {
    if (!selectedArticleId) {
      return [
        "What are the main stories today?",
        "Explain the AI Regulation Bill.",
        "Why is there a Fed rate cut expected?",
      ];
    }
    return [
      "What is the historical context?",
      "Summarize the key claims.",
      "Are there potential bias indicators?",
      "Explain the risks and opportunities.",
      "What are the future implications?",
    ];
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsLoading(true);
    setSelectedCitation(null); // Clear previous citation overlay

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const apiHistory = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await sendMessage(apiHistory, selectedArticleId);
      
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        citations: response.citations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Failed to generate response:", err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "My apologies. I encountered an error while attempting to process this query. Please verify your connection setup.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleArticleSelect = (id: string | undefined) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedArticleId(id);
    setSelectedCitation(null);

    // Add editorial note when focus changes
    const title = id 
      ? availableArticles.find(a => a.id === id)?.headline 
      : "General Briefing";
    
    const contextNote: Message = {
      id: `system-focus-${Date.now()}`,
      role: "assistant",
      content: id 
        ? `### Focus Pinned: ${title}\nOur conversation is now focused on this intelligence report. Ask me to outline its timeline, evaluate its primary citations, or check conflicting perspectives.`
        : `### Focus Pinned: General Briefing\nOur discussion is now opened to all news reports. You can ask for a broad summary of today's topics or select a specific article to dive deep.`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, contextNote]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSaveSettings = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await updateApiUrl(settingsUrl);
    if (success) {
      setShowSettings(false);
    }
  };

  // Custom Inline Markdown & Citation Parser
  const renderFormattedContent = (content: string, citations: Citation[] = []) => {
    const lines = content.split("\n");

    return lines.map((line, lineIdx) => {
      // Check if line is a header
      if (line.startsWith("### ")) {
        return (
          <Text key={lineIdx} style={[styles.header3Text, { color: colors.foreground }]}>
            {line.replace("### ", "")}
          </Text>
        );
      }
      if (line.startsWith("#### ")) {
        return (
          <Text key={lineIdx} style={[styles.header4Text, { color: colors.foreground }]}>
            {line.replace("#### ", "")}
          </Text>
        );
      }

      const isBullet = line.startsWith("- ") || line.startsWith("* ");
      const isBlockquote = line.startsWith("> ");
      let cleanLine = line;
      if (isBullet) cleanLine = line.substring(2);
      if (isBlockquote) cleanLine = line.substring(2);

      // Parse bold text and citation tags
      const parts = [];
      let currentIdx = 0;
      const regex = /(\*\*.*?\*\*|\[\d+\])/g;
      let match;
      let matchIdx = 0;

      while ((match = regex.exec(cleanLine)) !== null) {
        if (match.index > currentIdx) {
          parts.push(
            <Text key={`text-${matchIdx}-${currentIdx}`}>
              {cleanLine.substring(currentIdx, match.index)}
            </Text>
          );
        }

        const token = match[0];
        if (token.startsWith("**") && token.endsWith("**")) {
          parts.push(
            <Text key={`bold-${matchIdx}`} style={styles.boldText}>
              {token.substring(2, token.length - 2)}
            </Text>
          );
        } else if (token.startsWith("[") && token.endsWith("]")) {
          const numStr = token.substring(1, token.length - 1);
          const index = parseInt(numStr, 10) - 1;
          const citation = citations[index];

          if (citation) {
            parts.push(
              <TouchableOpacity
                key={`cit-${matchIdx}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCitation(citation);
                }}
                style={[styles.citationBadge, { backgroundColor: colors.accent + "18" }]}
                activeOpacity={0.6}
              >
                <Text style={[styles.citationBadgeText, { color: colors.accent }]}>
                  {token}
                </Text>
              </TouchableOpacity>
            );
          } else {
            parts.push(
              <Text key={`cit-fallback-${matchIdx}`} style={{ color: colors.mutedForeground }}>
                {token}
              </Text>
            );
          }
        }

        currentIdx = regex.lastIndex;
        matchIdx++;
      }

      if (currentIdx < cleanLine.length) {
        parts.push(
          <Text key={`text-end-${lineIdx}`}>
            {cleanLine.substring(currentIdx)}
          </Text>
        );
      }

      const rowContent = parts.length > 0 ? parts : cleanLine;

      if (isBlockquote) {
        return (
          <View key={lineIdx} style={[styles.blockquoteRow, { borderLeftColor: colors.accent }]}>
            <Text style={[styles.blockquoteText, { color: colors.mutedForeground }]}>
              {rowContent}
            </Text>
          </View>
        );
      }

      return (
        <View key={lineIdx} style={isBullet ? styles.bulletRow : styles.paragraphRow}>
          {isBullet && <View style={[styles.bulletDot, { backgroundColor: colors.accent }]} />}
          <Text style={[styles.bodyText, { color: colors.foreground, flex: 1 }]}>
            {rowContent}
          </Text>
        </View>
      );
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";

    return (
      <View style={[styles.msgContainer, isUser ? styles.msgUser : styles.msgAssistant]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.accentForeground }]}>ED</Text>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: colors.secondary }]
              : [styles.bubbleAssistant, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          {isUser ? (
            <Text style={[styles.bodyText, { color: colors.foreground }]}>{item.content}</Text>
          ) : (
            renderFormattedContent(item.content, item.citations)
          )}
          <Text style={[styles.msgTime, { color: colors.mutedForeground }]}>
            {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  };

  const selectedArticle = availableArticles.find((a) => a.id === selectedArticleId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* 1. Elegant Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 20 : insets.top + 10,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ask NewsLens</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            Speak with the Chief Editor
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Status Indicator */}
          <TouchableOpacity
            style={[styles.statusBadge, { borderColor: colors.border }]}
            onPress={() => checkConnection(apiUrl)}
            disabled={isChecking}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    isConnected === true
                      ? colors.success
                      : isConnected === false
                      ? colors.warning
                      : colors.mutedForeground,
                },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.foreground }]}>
              {isChecking
                ? "Connecting..."
                : isConnected === true
                ? "Qwen: Local"
                : "Qwen: Simulated"}
            </Text>
          </TouchableOpacity>

          {/* Settings Trigger */}
          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: colors.secondary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSettings(!showSettings);
            }}
          >
            <Feather name="sliders" size={16} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Connection Settings Drawer */}
      {showSettings && (
        <View style={[styles.settingsDrawer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.settingsHeader}>
            <Text style={[styles.settingsTitle, { color: colors.foreground }]}>PocketPal Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.settingsDesc, { color: colors.mutedForeground }]}>
            Specify the network URL of your PocketPal server (e.g., http://localhost:5001/v1).
          </Text>
          <View style={styles.settingsInputRow}>
            <TextInput
              value={settingsUrl}
              onChangeText={setSettingsUrl}
              placeholder="http://localhost:5001/v1"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.settingsInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={handleSaveSettings}
              style={[styles.settingsSaveBtn, { backgroundColor: colors.primary }]}
              disabled={isChecking}
            >
              {isChecking ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.settingsSaveBtnText, { color: colors.primaryForeground }]}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 3. Horizontal Article Focus Ribbon */}
      <View style={[styles.ribbonContainer, { borderBottomColor: colors.border }]}>
        <Text style={[styles.ribbonLabel, { color: colors.mutedForeground }]}>FOCUS ARTICLE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ribbonScroll}
        >
          {/* General (No specific article) Option */}
          <TouchableOpacity
            style={[
              styles.ribbonPill,
              !selectedArticleId && [styles.ribbonPillActive, { borderColor: colors.accent, backgroundColor: colors.accent + "09" }],
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
            onPress={() => handleArticleSelect(undefined)}
          >
            <Feather
              name="globe"
              size={12}
              color={!selectedArticleId ? colors.accent : colors.mutedForeground}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.ribbonPillText,
                { color: !selectedArticleId ? colors.accent : colors.foreground },
                !selectedArticleId && styles.ribbonPillTextActive,
              ]}
            >
              General Q&A
            </Text>
          </TouchableOpacity>

          {/* List of articles */}
          {availableArticles.map((article) => {
            const isSelected = selectedArticleId === article.id;
            return (
              <TouchableOpacity
                key={article.id}
                style={[
                  styles.ribbonPill,
                  isSelected && [styles.ribbonPillActive, { borderColor: colors.accent, backgroundColor: colors.accent + "09" }],
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
                onPress={() => handleArticleSelect(article.id)}
              >
                <View style={[styles.pubDot, { backgroundColor: article.imageColor }]} />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.ribbonPillText,
                    { color: isSelected ? colors.accent : colors.foreground },
                    isSelected && styles.ribbonPillTextActive,
                    { maxWidth: 180 },
                  ]}
                >
                  {article.headline}
                </Text>
                <View style={[styles.miniScore, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.miniScoreText, { color: colors.mutedForeground }]}>
                    {article.credibilityScore}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Chat Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[styles.chatContent, { paddingBottom: selectedCitation ? 150 : 20 }]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Text style={[styles.avatarText, { color: colors.accentForeground }]}>ED</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleAssistant, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.loaderRow}>
                  <Feather name="feather" size={14} color={colors.accent} style={styles.loaderIcon} />
                  <Text style={[styles.loaderText, { color: colors.mutedForeground }]}>
                    Drafting evidence-focused analysis...
                  </Text>
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* 5. Floating Citation Inspector Drawer */}
      {selectedCitation && (
        <View
          style={[
            styles.citationDrawer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.foreground,
            },
          ]}
        >
          <View style={styles.citationDrawerHeader}>
            <View style={styles.citationDrawerBadge}>
              <Feather name="shield" size={12} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.citationDrawerBadgeText, { color: colors.accent }]}>
                Verified Citation Source
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedCitation(null)}
              style={[styles.closeBtn, { backgroundColor: colors.secondary }]}
            >
              <Feather name="x" size={14} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.citationDrawerTitle, { color: colors.foreground }]}>
            {selectedCitation.title}
          </Text>
          <Text style={[styles.citationDrawerPub, { color: colors.mutedForeground }]}>
            Publisher: {selectedCitation.publisher}
          </Text>
          <ScrollView style={styles.citationDrawerScroll}>
            <Text style={[styles.citationDrawerExcerpt, { color: colors.foreground }]}>
              "{selectedCitation.excerpt}"
            </Text>
          </ScrollView>
        </View>
      )}

      {/* 6. Footer: Suggestions & Input Bar */}
      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
        {/* Scrollable suggested queries */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionScroll}
        >
          {getSuggestions().map((suggestion, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSuggestionPress(suggestion)}
              style={[styles.suggestionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
              disabled={isLoading}
            >
              <Text style={[styles.suggestionChipText, { color: colors.mutedForeground }]}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Textbox */}
        <View style={styles.inputContainer}>
          <TextInput
            value={inputVal}
            onChangeText={setInputVal}
            placeholder={
              selectedArticle
                ? `Ask about "${selectedArticle.headline.substring(0, 20)}..."`
                : "Ask about analyzed stories..."
            }
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: inputVal.trim() && !isLoading ? colors.accent : colors.secondary,
              },
            ]}
            onPress={() => handleSend(inputVal)}
            disabled={!inputVal.trim() || isLoading}
          >
            <Feather
              name="send"
              size={16}
              color={inputVal.trim() && !isLoading ? colors.accentForeground : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerLeft: { gap: 1 },
  headerTitle: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  settingsBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  // Settings Drawer
  settingsDrawer: {
    padding: 14,
    borderBottomWidth: 1,
    gap: 8,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  settingsDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  settingsInputRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  settingsInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  settingsSaveBtn: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsSaveBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  // Article ribbon
  ribbonContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  ribbonLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginLeft: 16,
    marginBottom: 6,
  },
  ribbonScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
  },
  ribbonPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  ribbonPillActive: {
    borderWidth: 1,
  },
  pubDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ribbonPillText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  ribbonPillTextActive: {
    fontFamily: "Inter_600SemiBold",
  },
  miniScore: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniScoreText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
  // Chat
  chatContent: {
    padding: 16,
    gap: 16,
  },
  msgContainer: {
    flexDirection: "row",
    width: "100%",
  },
  msgUser: {
    justifyContent: "flex-end",
  },
  msgAssistant: {
    justifyContent: "flex-start",
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  avatarText: {
    fontSize: 11,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  bubble: {
    maxWidth: "85%",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  bubbleUser: {
    borderTopRightRadius: 2,
  },
  bubbleAssistant: {
    borderTopLeftRadius: 2,
    borderWidth: 1,
  },
  bodyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  boldText: {
    fontFamily: "Inter_700Bold",
  },
  header3Text: {
    fontSize: 15,
    fontFamily: "PlayfairDisplay_700Bold",
    marginTop: 10,
    marginBottom: 4,
  },
  header4Text: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
    marginBottom: 2,
  },
  paragraphRow: {
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  blockquoteRow: {
    borderLeftWidth: 2,
    paddingLeft: 8,
    marginVertical: 4,
  },
  blockquoteText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 18,
  },
  citationBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginHorizontal: 1,
  },
  citationBadgeText: {
    fontSize: 11,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  msgTime: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  // Loader
  loadingContainer: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  loaderIcon: {
    marginTop: 1,
  },
  loaderText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  // Citation Drawer
  citationDrawer: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 140,
    zIndex: 100,
  },
  citationDrawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  citationDrawerBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  citationDrawerBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  citationDrawerTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  citationDrawerPub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  citationDrawerScroll: {
    flex: 1,
  },
  citationDrawerExcerpt: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 17,
  },
  // Footer
  footer: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionScroll: {
    gap: 6,
    flexDirection: "row",
    paddingVertical: 2,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  inputContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 1,
  },
});
