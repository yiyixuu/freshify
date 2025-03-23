import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TabBar } from "@/components/TabBar";

const categories = [
  {
    id: "protein",
    title: "Protein Rich",
    description: "High protein meals for muscle health",
    icon: "barbell-outline",
    examples: "Chicken, Fish, Legumes",
  },
  {
    id: "carbs",
    title: "Light Carbs",
    description: "Balanced carbohydrate options",
    icon: "leaf-outline",
    examples: "Quinoa, Sweet Potato, Brown Rice",
  },
  {
    id: "vitamins",
    title: "Vitamin Rich",
    description: "Essential vitamins and minerals",
    icon: "nutrition-outline",
    examples: "Fruits, Vegetables, Nuts",
  },
];

const vitaminCategories = [
  { id: "a", name: "Vitamin A", icon: "eye-outline" },
  { id: "b", name: "Vitamin B", icon: "flash-outline" },
  { id: "c", name: "Vitamin C", icon: "shield-outline" },
  { id: "d", name: "Vitamin D", icon: "sunny-outline" },
  { id: "e", name: "Vitamin E", icon: "leaf-outline" },
  { id: "k", name: "Vitamin K", icon: "fitness-outline" },
];

export default function RecipesScreen() {
  const handleCategoryPress = (categoryId: string) => {
    if (categoryId === "vitamins") {
      // Show vitamin selection
      setShowVitamins(true);
    } else {
      // Navigate to recipes list for the category
      router.push({
        pathname: "/(tabs)/recipe-list",
        params: { category: categoryId },
      } as any);
    }
  };

  const [showVitamins, setShowVitamins] = React.useState(false);

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Recipes</ThemedText>
          {showVitamins && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowVitamins(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#22c55e" />
            </TouchableOpacity>
          )}
        </ThemedView>

        <ThemedView style={styles.content}>
          {!showVitamins ? (
            <>
              <ThemedText style={styles.subtitle}>
                Choose a nutritional focus
              </ThemedText>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <View style={styles.categoryHeader}>
                    <Ionicons
                      name={category.icon as any}
                      size={24}
                      color="#22c55e"
                    />
                    <ThemedText style={styles.categoryTitle}>
                      {category.title}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.categoryDescription}>
                    {category.description}
                  </ThemedText>
                  <ThemedText style={styles.categoryExamples}>
                    {category.examples}
                  </ThemedText>
                  <View style={styles.arrowContainer}>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#64748b"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <ThemedText style={styles.subtitle}>Select a vitamin</ThemedText>
              <View style={styles.vitaminGrid}>
                {vitaminCategories.map((vitamin) => (
                  <TouchableOpacity
                    key={vitamin.id}
                    style={styles.vitaminCard}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/recipe-list",
                        params: { category: `vitamin-${vitamin.id}` },
                      } as any)
                    }
                  >
                    <Ionicons
                      name={vitamin.icon as any}
                      size={32}
                      color="#22c55e"
                    />
                    <ThemedText style={styles.vitaminName}>
                      {vitamin.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ThemedView>
      </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  } as ViewStyle,
  container: {
    flex: 1,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  } as ViewStyle,
  backButton: {
    padding: 8,
  } as ViewStyle,
  content: {
    flex: 1,
    padding: 20,
  } as ViewStyle,
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 20,
  } as TextStyle,
  categoryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  } as ViewStyle,
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  } as TextStyle,
  categoryDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  } as TextStyle,
  categoryExamples: {
    fontSize: 12,
    color: "#94a3b8",
  } as TextStyle,
  arrowContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
  } as ViewStyle,
  vitaminGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  } as ViewStyle,
  vitaminCard: {
    width: "33.33%",
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  } as ViewStyle,
  vitaminName: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  } as TextStyle,
});
