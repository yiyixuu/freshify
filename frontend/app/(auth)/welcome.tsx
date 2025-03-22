import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function Welcome() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#f0f9ff", "#e0f2fe"]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Freshify</Text>
        <Text style={styles.subtitle}>Your local fresh food marketplace</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(auth)/location")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    width: "80%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
