import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  TouchableOpacity,
  SafeAreaView,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
  useColorScheme,
  AppState,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { Stack } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { sendFaceSwapRequest } from './sendApi';
import { useImageManipulation } from './useImageManipulation';
import { usePanResponder } from './usePanResponder';
import { styles } from './styles';

async function cleanupTemporaryFiles() {
  try {
    const imageManipulatorDir = `${FileSystem.cacheDirectory}ImageManipulator`;
    const dirInfo = await FileSystem.getInfoAsync(imageManipulatorDir);

    if (dirInfo.exists && dirInfo.isDirectory) {
      await FileSystem.deleteAsync(imageManipulatorDir, { idempotent: true });
      console.log('Temporary ImageManipulator files cleaned up');
    } else {
      console.log('No ImageManipulator directory found');
    }
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
}

export default function HomeScreen() {
  const [image, setImage] = useState(null);
  const [enclosingShape, setEnclosingShape] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blendingComplete, setBlendingComplete] = useState(false);
  const pointsRef = useRef([]);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const viewShotRef = useRef(null);

  const { pickImage } = useImageManipulation({
    image,
    setImage,
    setGeneratedImage,
    setIsLoading,
    setError,
    setBlendingComplete,
  });

  const { panResponder } = usePanResponder({
    pointsRef,
    setPath: () => {}, // We don't need this anymore
    setIsDrawing: () => {}, // We don't need this anymore
    setEnclosingShape,
    setScrollEnabled,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        cleanupTemporaryFiles();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (blendingComplete) {
      Alert.alert(
        'Success',
        'Image blending complete. The result should now be visible.'
      );
    }
  }, [blendingComplete, generatedImage]);

  const clearCanvas = () => {
    setEnclosingShape('');
    setGeneratedImage(null);
    pointsRef.current = [];
  };

  const handleFaceSwap = async () => {
    if (image && enclosingShape) {
      setIsLoading(true);
      try {
        const faceSwappedImageUrl = await sendFaceSwapRequest(viewShotRef);
        if (faceSwappedImageUrl) {
          setGeneratedImage(faceSwappedImageUrl);
          setBlendingComplete(true);
          setEnclosingShape(''); // Clear the enclosing shape
        } else {
          setError('Failed to generate face-swapped image');
        }
      } catch (error) {
        console.error('Error capturing image:', error);
        setError('Failed to capture image');
      } finally {
        setIsLoading(false);
      }
    } else if (!image) {
      setError('No image to process');
    } else {
      setError('No enclosing shape drawn');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.content}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.8 }}>
            <ThemedView style={styles.canvasContainer}>
              <ThemedView style={styles.canvas} {...panResponder.panHandlers}>
                {image && !generatedImage && (
                  <>
                    <Image source={{ uri: image }} style={styles.image} />
                    <Svg height="100%" width="100%" style={styles.absoluteFill}>
                      {enclosingShape && (
                        <Path
                          d={enclosingShape}
                          fill="#00ff00"
                          fillOpacity={0.3}
                        />
                      )}
                    </Svg>
                  </>
                )}
                {generatedImage && (
                  <Image
                    source={{ uri: generatedImage }}
                    style={styles.generatedImage}
                  />
                )}
                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0a7ea4" />
                  </View>
                )}
                {!image && !generatedImage && (
                  <TouchableOpacity
                    style={styles.pickImageButton}
                    onPress={pickImage}
                  >
                    <ThemedText style={styles.pickImageText}>
                      Pick an image
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </ThemedView>
            </ThemedView>
          </ViewShot>
          {enclosingShape && !generatedImage && (
            <TouchableOpacity style={styles.undoButton} onPress={clearCanvas}>
              <ThemedText style={styles.undoButtonText}>Clear</ThemedText>
            </TouchableOpacity>
          )}
          {blendingComplete && (
            <ThemedText style={styles.successText}>
              Face swap complete! The result is visible in the image above.
            </ThemedText>
          )}
          {error && (
            <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
          )}
          <ThemedView style={styles.promptContainer}>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleFaceSwap}
              disabled={isLoading || !image || !enclosingShape}
            >
              <ThemedText style={styles.generateButtonText}>
                {isLoading ? 'Processing...' : 'Swap Face'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
