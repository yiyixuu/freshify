import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TabBar } from "@/components/TabBar";

interface Item {
  id: number;
  created_at: string;
  name: string;
  quantity: number;
  price: number;
  expiry: number;
  user_id: string;
  img_url: string;
}

interface Recipe {
  recipe_name: string;
  description: string;
  cooking_time: string;
  ingredients: {
    [key: string]: {
      quantity: string;
      have: boolean;
    };
  };
  instructions: string[];
  nutritional_benefits: string[];
}

export default function RecipeListScreen() {
  const params = useLocalSearchParams<{ category: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCategoryTitle = () => {
    if (params.category?.startsWith("vitamin-")) {
      const vitamin = params.category.split("-")[1].toUpperCase();
      return `Vitamin ${vitamin} Recipes`;
    }
    switch (params.category) {
      case "protein":
        return "Protein Rich Recipes";
      case "carbs":
        return "Light Carb Recipes";
      default:
        return "Recipes";
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchRecipe = async (inventoryItems: Item[]) => {
    try {
      // Format the nutritional focus based on the category
      let nutritionalFocus = params.category;
      if (params.category?.startsWith("vitamin-")) {
        nutritionalFocus = `rich in ${params.category.replace("-", " ")}`;
      } else if (params.category === "protein") {
        nutritionalFocus = "high in protein";
      } else if (params.category === "carbs") {
        nutritionalFocus = "light on carbohydrates";
      }

      // Format the ingredients array for the API
      const ingredients = inventoryItems.map((item) => ({
        name: item.name,
        expiry: item.expiry,
      }));

      // Make the API request
      const response = await fetch(
        process.env.EXPO_PUBLIC_BACKEND_URL + "/get_recipe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nutritional_focus: nutritionalFocus,
            ingredients: ingredients,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recipe");
      }

      const recipeData = await response.json();
      setRecipe(recipeData);
    } catch (error: any) {
      console.error("Error fetching recipe:", error);
      setError(error.message);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        router.replace("/(auth)/signin" as any);
        return;
      }

      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id);

      if (itemsError) throw itemsError;

      const itemsWithImages = await Promise.all(
        (items || []).map(async (item) => {
          const { data: refImage, error: refError } = await supabase
            .from("food_reference_images")
            .select("file_name")
            .eq("food_name", item.name.toLowerCase())
            .single();

          if (refError || !refImage?.file_name) return item;

          const { data } = await supabase.storage
            .from("food-images")
            .createSignedUrl(refImage.file_name, 60);

          return {
            ...item,
            img_url: data?.signedUrl,
          };
        })
      );

      setItems(itemsWithImages);
      // Fetch recipe after getting inventory items
      await fetchRecipe(itemsWithImages);
    } catch (error: any) {
      console.error("Error fetching inventory items:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <ThemedText style={styles.loadingText}>
            Finding the perfect recipe...
          </ThemedText>
        </ThemedView>
        <TabBar />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#22c55e" />
          </TouchableOpacity>
          <ThemedText type="title">{getCategoryTitle()}</ThemedText>
          <View style={styles.headerRight} />
        </ThemedView>

        <ThemedView style={styles.content}>
          {recipe ? (
            <>
              <ThemedText style={styles.recipeTitle}>
                {recipe.recipe_name}
              </ThemedText>
              <ThemedText style={styles.recipeDescription}>
                {recipe.description}
              </ThemedText>

              <View style={styles.cookingTimeContainer}>
                <Ionicons name="time-outline" size={20} color="#64748b" />
                <ThemedText style={styles.cookingTime}>
                  {recipe.cooking_time}
                </ThemedText>
              </View>

              <ThemedText style={styles.sectionTitle}>Ingredients</ThemedText>
              {Object.entries(recipe.ingredients).map(([name, details]) => (
                <View key={name} style={styles.ingredientRow}>
                  <ThemedText style={styles.ingredientName}>
                    {name} ({details.quantity})
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.ingredientStatus,
                      details.have
                        ? styles.haveIngredient
                        : styles.needIngredient,
                    ]}
                  >
                    {details.have ? "In Stock" : "Need to Buy"}
                  </ThemedText>
                </View>
              ))}

              <ThemedText style={styles.sectionTitle}>Instructions</ThemedText>
              {recipe.instructions.map((step, index) => (
                <View key={index} style={styles.instructionStep}>
                  <ThemedText style={styles.stepNumber}>{index + 1}</ThemedText>
                  <ThemedText style={styles.stepText}>{step}</ThemedText>
                </View>
              ))}

              <ThemedText style={styles.sectionTitle}>Benefits</ThemedText>
              {recipe.nutritional_benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
                </View>
              ))}
            </>
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                No recipe found. Try adding more ingredients to your inventory!
              </ThemedText>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push("/(camera)/receipt")}
              >
                <ThemedText style={styles.scanButtonText}>
                  Scan Receipt
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  } as TextStyle,
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
  headerRight: {
    width: 40,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  } as ViewStyle,
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  } as TextStyle,
  itemsGrid: {
    gap: 16,
  } as ViewStyle,
  scanButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  } as ViewStyle,
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,
  recipeTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  } as TextStyle,
  recipeDescription: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 16,
  } as TextStyle,
  cookingTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  } as ViewStyle,
  cookingTime: {
    fontSize: 16,
    color: "#64748b",
    marginLeft: 8,
  } as TextStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 16,
  } as TextStyle,
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  } as ViewStyle,
  ingredientName: {
    fontSize: 16,
  } as TextStyle,
  ingredientStatus: {
    fontSize: 14,
    fontWeight: "500",
  } as TextStyle,
  haveIngredient: {
    color: "#22c55e",
  } as TextStyle,
  needIngredient: {
    color: "#ef4444",
  } as TextStyle,
  instructionStep: {
    flexDirection: "row",
    marginBottom: 16,
  } as ViewStyle,
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    color: "white",
    textAlign: "center",
    lineHeight: 24,
    marginRight: 12,
  } as TextStyle,
  stepText: {
    flex: 1,
    fontSize: 16,
  } as TextStyle,
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  } as ViewStyle,
  benefitText: {
    fontSize: 16,
    marginLeft: 12,
  } as TextStyle,
});
