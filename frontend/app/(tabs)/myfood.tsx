import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
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

export default function MyFoodScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchItems();
    }, [])
  );

  const fetchItems = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/(auth)/signin" as any);
        return;
      }

      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .order("expiry", { ascending: true }); // Sort by expiry date

      if (itemsError) throw itemsError;

      // Get images for all items
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
    } catch (error: any) {
      console.error("Error fetching items:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </ThemedView>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">My Food</ThemedText>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={24} color="#64748b" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.content}>
          {items.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                No food items yet. Add some by scanning your receipts!
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
          ) : (
            <View style={styles.itemsGrid}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/food-detail",
                      params: {
                        id: item.id,
                        name: item.name,
                        expiry: item.expiry,
                        quantity: item.quantity,
                        img_url: item.img_url,
                      },
                    } as any)
                  }
                >
                  <ThemedView style={styles.itemCard}>
                    <Image
                      source={{ uri: item.img_url }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    <View style={styles.itemInfo}>
                      <ThemedText style={styles.itemName}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={styles.itemQuantity}>
                        Quantity: {item.quantity}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.itemExpiry,
                          item.expiry <= 5 && styles.expiringText,
                        ]}
                      >
                        Expires in {item.expiry} days
                      </ThemedText>
                    </View>
                    <TouchableOpacity style={styles.removeButton}>
                      <Ionicons name="close-circle" size={24} color="#22c55e" />
                    </TouchableOpacity>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </View>
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
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  itemsGrid: {
    gap: 16,
  },
  itemCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  itemExpiry: {
    fontSize: 14,
    color: "#64748b",
  },
  expiringText: {
    color: "#ef4444",
  },
  removeButton: {
    padding: 4,
  },
  scanButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
