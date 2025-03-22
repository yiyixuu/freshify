import { Image, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <ParallaxScrollView headerImage={<Image source={require('@/assets/images/logo.png')} />} headerBackgroundColor={{
      dark: '#000',
      light: '#fff'
    }}>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="title">Welcome to Freshify</ThemedText>
        <ThemedText type="subtitle">Get started by taking a photo of your food</ThemedText>
        <TouchableOpacity 
          onPress={() => router.push('/(camera)/camera')}
          style={styles.button}
        >
          <ThemedText style={styles.buttonText} type="subtitle">Take Photo</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
  },
});
