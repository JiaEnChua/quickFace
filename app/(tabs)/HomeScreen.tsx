import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  TouchableOpacity,
  SafeAreaView,
  View,
  ActivityIndicator,
  ScrollView,
  AppState,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { Stack } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

import { SwapResultAnnouncement } from '@/components/SwapResultAnnouncement';
import { saveImage, cleanupTemporaryFiles } from '@/utils';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { sendFaceSwapRequest } from './sendApi';
import { usePanResponder } from '../../hooks/usePanResponder';
import { styles } from './styles';
import { GREEN_HIGHLIGHT_COLOR } from '../../constants';
import { pickImage } from '../../utils';

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enclosingShape, setEnclosingShape] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blendingComplete, setBlendingComplete] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const viewShotRef = useRef(null);

  const handlePickImage = async () => {
    const pickedImageUri = await pickImage();
    if (pickedImageUri) {
      setImage(pickedImageUri);
      setTimeout(async () => {
        let uriToSave = await viewShotRef.current?.capture();
        const base64 = await FileSystem.readAsStringAsync(uriToSave, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setOriginalImage(base64);
      }, 100);
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
    if (originalImage) {
      setIsLoading(true);
      try {
        const capturedUri = await viewShotRef.current?.capture();
        const capturedBase64 = await FileSystem.readAsStringAsync(capturedUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const faceSwappedImageUrl = await sendFaceSwapRequest(
          capturedBase64,
          GREEN_HIGHLIGHT_COLOR,
          originalImage
        );
        if (faceSwappedImageUrl) {
          setGeneratedImage(faceSwappedImageUrl);
          setBlendingComplete(true);
          setEnclosingShape('');
        } else {
          setError('Failed to generate face-swapped image');
        }
      } catch (error) {
        console.error('Error in face swap process:', error);
        setError('Failed to process image');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('No image to process');
    }
  };

  const resetApp = () => {
    setImage(null);
    setOriginalImage(null);
    setEnclosingShape('');
    setGeneratedImage(null);
    setIsLoading(false);
    setError(null);
    setBlendingComplete(false);
  };

  useEffect(() => {
    if (error) {
      clearCanvas();
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.content}>
          <SwapResultAnnouncement
            blendingComplete={blendingComplete}
            error={error}
          />
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.8 }}>
            <ThemedView style={styles.canvasContainer}>
              <ThemedView style={styles.canvas} {...panResponder.panHandlers}>
                {image && !generatedImage && (
                  <>
                    <Image
                      source={{ uri: image }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                    <Svg height="100%" width="100%" style={styles.absoluteFill}>
                      {enclosingShape && (
                        <Path
                          d={enclosingShape}
                          fill={GREEN_HIGHLIGHT_COLOR}
                          fillOpacity={1}
                        />
                      )}
                    </Svg>
                  </>
                )}
                {generatedImage && (
                  <Image
                    source={{ uri: generatedImage }}
                    style={styles.image}
                    resizeMode="contain"
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
          <View style={styles.clearButtonContainer}>
            {(generatedImage || enclosingShape) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearCanvas}
              >
                <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
              </TouchableOpacity>
            )}
          </View>
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
