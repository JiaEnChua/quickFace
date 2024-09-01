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
import * as MediaLibrary from 'expo-media-library';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { sendFaceSwapRequest } from './sendApi';
import { useImageManipulation } from './useImageManipulation';
import { usePanResponder } from './usePanResponder';
import { styles } from './styles';
import { saveImage, cleanupTemporaryFiles } from '@/utils';

export default function HomeScreen() {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [enclosingShape, setEnclosingShape] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blendingComplete, setBlendingComplete] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const viewShotRef = useRef(null);
  console.log('scrollEnabled: ', scrollEnabled);

  const { pickImage } = useImageManipulation({
    setImage,
    setIsLoading,
    setError,
  });

  const saveOriginalImage = async () => {
    try {
      let uriToSave = await viewShotRef.current?.capture();
      setOriginalImage(uriToSave);
    } catch (error) {
      console.error('Error saving original image:', error);
    }
  };

  const handlePickImage = async () => {
    const pickedImageUri = await pickImage();
    if (pickedImageUri) {
      // Wait for the image to be rendered in the ViewShot
      setTimeout(async () => {
        await saveOriginalImage();
      }, 100); // Adjust this delay if needed
    }
  };

  const { panResponder } = usePanResponder({
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

  const clearCanvas = () => {
    setEnclosingShape('');
    setGeneratedImage(null);
    setError(null);
    setBlendingComplete(false);
    setIsLoading(false);
  };

  const handleFaceSwap = async () => {
    if (image) {
      setIsLoading(true);
      try {
        // Recapture the current state of the image
        const capturedUri = await viewShotRef.current?.capture();

        const faceSwappedImageUrl = await sendFaceSwapRequest(
          capturedUri, // Pass the newly captured URI instead of viewShotRef
          !enclosingShape,
          originalImage || ''
        );
        if (faceSwappedImageUrl) {
          setGeneratedImage(faceSwappedImageUrl);
          setBlendingComplete(true);
          setEnclosingShape('');
        } else {
          setError('Failed to generate face-swapped image');
        }
      } catch (error) {
        console.error('Error capturing image:', error);
        setError('Failed to capture image');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('No image to process');
    }
  };

  const resetApp = () => {
    setImage(null);
    setEnclosingShape('');
    setGeneratedImage(null);
    setOriginalImage(null);
    setIsLoading(false);
    setError(null);
    setBlendingComplete(false);
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
                    onPress={handlePickImage}
                  >
                    <ThemedText style={styles.pickImageText}>
                      Pick an image
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </ThemedView>
            </ThemedView>
          </ViewShot>
          {image && enclosingShape && (
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
              style={[
                styles.generateButton,
                (isLoading || !image) && styles.generateButtonDisabled,
              ]}
              onPress={handleFaceSwap}
              disabled={isLoading || !image}
            >
              <ThemedText
                style={[
                  styles.generateButtonText,
                  (isLoading || !image) && styles.generateButtonTextDisabled,
                ]}
              >
                {isLoading ? 'Processing...' : 'Auto detection swap'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.generateButton,
                styles.saveButton,
                !generatedImage && styles.generateButtonDisabled,
              ]}
              onPress={() => saveImage(generatedImage)}
              disabled={!generatedImage}
            >
              <ThemedText style={[styles.generateButtonText]}>
                Save Photo
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.generateButton, styles.resetButton]}
              onPress={resetApp}
            >
              <ThemedText style={styles.generateButtonText}>Reset</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
