import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
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
import Constants from "expo-constants";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

// Dynamically resolve the NewsLens API server URL
const getNewsApiBaseUrl = () => {
  if (Platform.OS === "web") return "http://localhost:5000";
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];
  return localhost ? `http://${localhost}:5000` : "http://localhost:5000";
};

export default function AnalyzeDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addToHistory } = useApp();

  const [link, setLink] = useState("");
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [text, setText] = useState("");
  
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [auditStatus, setAuditStatus] = useState("Auditing credibility index...");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setScreenshotUri(asset.uri);
      
      if (asset.base64) {
        setIsOcrLoading(true);
        try {
          const newsUrl = getNewsApiBaseUrl();
          const response = await fetch(`${newsUrl}/api/ocr`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: asset.base64 }),
          });
          if (response.ok) {
            const data = await response.json();
            setText(data.text);
          } else {
            alert("Failed to perform OCR on screenshot.");
          }
        } catch (err) {
          console.error("OCR upload error:", err);
          alert("Error connecting to OCR server.");
        } finally {
          setIsOcrLoading(false);
        }
      }
    }
  };

  const handleRunAudit = async () => {
    if (!link.trim() && !screenshotUri && !text.trim()) {
      alert("Please provide at least one input: an Article Link/URL, a Screenshot, or copy-pasted Text.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAuditLoading(true);
    setAuditStatus("Running dual-model audit...");

    // Cycle through messages to indicate progress
    const statuses = [
      "Running credibility audit via DeepSeek...",
      "Extracting summaries via Minimax...",
      "Correlating timeline and claims...",
      "Compiling analysis report..."
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % statuses.length;
      setAuditStatus(statuses[idx]);
    }, 3500);

    try {
      const newsUrl = getNewsApiBaseUrl();
      const response = await fetch(`${newsUrl}/api/articles/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: link, text: text }),
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();
      
      // Add the new article to local app history
      addToHistory(result.article);

      // Navigate to the newly generated report
      router.push(`/analysis/${result.article.id}`);
    } catch (err) {
      clearInterval(interval);
      console.error("Audit failed:", err);
      alert("Failed to run credibility audit. Please check your network and API keys.");
    } finally {
      setIsAuditLoading(false);
    }
  };

  if (isAuditLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 30 }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 24, textAlign: "center" }}>
          {auditStatus}
        </Text>
        <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 8, textAlign: "center" }}>
          Analyzing credibility with DeepSeek & Minimax. This takes a few seconds.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: topPad + 12, paddingBottom: bottomPad + 30 }}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Factual Auditing</Text>
        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
          Submit any article to perform a dual-model credibility and summarization audit
        </Text>

        <View style={styles.form}>
          {/* Link field */}
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Article Link / URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            placeholder="https://example.com/news-story"
            placeholderTextColor={colors.mutedForeground}
            value={link}
            onChangeText={setLink}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {/* Screenshot field */}
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Screenshot Upload (Google ML OCR)</Text>
          <TouchableOpacity
            style={[styles.uploadBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={pickImage}
            disabled={isOcrLoading}
          >
            {isOcrLoading ? (
              <View style={styles.loaderCenter}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={[styles.uploadText, { color: colors.mutedForeground, marginTop: 8 }]}>
                  Performing Google ML text recognition...
                </Text>
              </View>
            ) : screenshotUri ? (
              <View style={styles.imagePreviewRow}>
                <Image source={{ uri: screenshotUri }} style={styles.imagePreview} />
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Screenshot Uploaded</Text>
                  <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>Tap to select another image</Text>
                </View>
              </View>
            ) : (
              <View style={styles.uploadCenter}>
                <Feather name="image" size={24} color={colors.mutedForeground} />
                <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Upload News Screenshot</Text>
                <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>Google ML Kit extracts text instantly</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Text field */}
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Article Content / Text</Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
            placeholder="Extracted article text will appear here. Or copy-paste the text content directly..."
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleRunAudit}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Feather name="zap" size={15} color={colors.primaryForeground} style={{ marginRight: 6 }} />
            <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
              Run Factual Audit
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: {
    fontSize: 26,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  form: {
    gap: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    marginBottom: -8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  uploadBox: {
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: "dashed",
    padding: 16,
    minHeight: 90,
    justifyContent: "center",
  },
  uploadCenter: {
    alignItems: "center",
    gap: 4,
  },
  loaderCenter: {
    alignItems: "center",
  },
  uploadTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  uploadSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  imagePreviewRow: {
    flexDirection: "row",
    gap: 12,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: "#e1e5eb",
  },
  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  submitBtn: {
    flexDirection: "row",
    height: 46,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  uploadText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
