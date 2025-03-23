import {
  CameraView,
  CameraType,
  useCameraPermissions,
  FlashMode,
} from "expo-camera";
import { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ExpiryItem {
  name: string;
  expiration_days: number;
}

interface ExpiryResults {
  foods: ExpiryItem[];
}

export default function App() {
  const { items } = useLocalSearchParams();
  const receiptItems = items ? JSON.parse(items as string) : [];

  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  function toggleFlash() {
    setFlash((current) => (current === "off" ? "on" : "off"));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync();
        if (!photo) {
          throw new Error("Failed to take picture");
        }
        setUri(photo.uri);

        // Convert the photo to base64
        const base64Image = await FileSystem.readAsStringAsync(photo.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Send to backend
        const response = await fetch(
          process.env.EXPO_PUBLIC_BACKEND_URL + "/analyze_image",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              image: base64Image,
              items: receiptItems,
            }),
          }
        );

        let result;
        if (!response.ok) {
          result = {
            error:
              "Failed to analyze image. Please try again with a clearer picture.",
          };
        } else {
          const expiryResults = await response.json();

          // Combine receipt data with expiry data
          const consolidatedResults = {
            items: receiptItems.map((receiptItem: ReceiptItem) => {
              const expiryItem = expiryResults.foods.find(
                (food: ExpiryItem) =>
                  food.name.toLowerCase() === receiptItem.name.toLowerCase()
              );
              return {
                ...receiptItem,
                expiration_days: expiryItem ? expiryItem.expiration_days : null,
              };
            }),
          };

          result = consolidatedResults;
        }

        // Navigate to results screen with consolidated data
        router.push({
          pathname: "/(camera)/results" as any,
          params: { data: JSON.stringify(result) },
        });
      } catch (error) {
        console.log("Error taking picture");
        router.push({
          pathname: "/(camera)/results" as any,
          params: {
            data: JSON.stringify({
              error:
                "Failed to process image. Please check your connection and try again.",
            }),
          },
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderPicture = () => {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: uri! }}
          contentFit="contain"
          style={styles.preview}
        />
        {loading && (
          <View style={styles.analysisOverlay}>
            <Text style={styles.analysisText}>Analyzing...</Text>
            <ActivityIndicator size="small" color="white" />
          </View>
        )}
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        <View style={styles.cornerOverlay}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>
            Take a picture of your groceries
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleFlash}>
            <Ionicons
              name={flash === "off" ? "flash-off" : "flash"}
              size={32}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="large" />
            ) : (
              <View style={styles.captureCircle} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    );
  };

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  flipButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "transparent",
    borderWidth: 4,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  captureCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "white",
  },
  retakeButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
  },
  retakeText: {
    color: "white",
    fontSize: 16,
  },
  analysisOverlay: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  analysisText: {
    color: "white",
    fontSize: 16,
  },
  instructionOverlay: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    padding: 15,
  },
  instructionText: {
    color: "white",
    fontSize: 16,
  },
  cornerOverlay: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    bottom: 120,
    margin: 40,
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#4CAF50", // Material Design green
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});
