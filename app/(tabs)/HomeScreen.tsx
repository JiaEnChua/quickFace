import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  TextInput,
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
  const [prompt, setPrompt] = useState('');
  const [enclosingShape, setEnclosingShape] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blendingComplete, setBlendingComplete] = useState(false);
  const pointsRef = useRef([]);
  const [path, setPath] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const viewShotRef = useRef(null);

  const colorScheme = useColorScheme();
  const inputStyle = [
    styles.input,
    { color: colorScheme === 'dark' ? '#fff' : '#000' },
    { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' },
  ];

  const { generateImageWithHuggingFace, pickImage, saveImageOnDevice } =
    useImageManipulation({
      image,
      setImage,
      setGeneratedImage,
      setIsLoading,
      setError,
      setBlendingComplete,
    });

  const { panResponder } = usePanResponder({
    pointsRef,
    setPath,
    setIsDrawing,
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

  const generateAIContent = async () => {
    if (!prompt) {
      Alert.alert('Error', 'Please enter a prompt.');
      return;
    }
    if (!enclosingShape) {
      Alert.alert('Error', 'Please draw an area on the image.');
      return;
    }
    await generateImageWithHuggingFace(prompt, enclosingShape);
  };

  const handleUndo = () => {
    setEnclosingShape('');
    setGeneratedImage(null);
    pointsRef.current = [];
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
                {image && (
                  <>
                    <Image source={{ uri: image }} style={styles.image} />
                    <Svg height="100%" width="100%" style={styles.absoluteFill}>
                      {enclosingShape && !generatedImage && (
                        <Path
                          d={enclosingShape}
                          fill="#00ff00"
                          fillOpacity={1}
                        />
                      )}
                    </Svg>
                    {generatedImage && (
                      <Image
                        source={{ uri: generatedImage }}
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          resizeMode: 'contain',
                        }}
                      />
                    )}
                    {isLoading && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#0a7ea4" />
                      </View>
                    )}
                  </>
                )}
                {!image && (
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
            <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
              <ThemedText style={styles.undoButtonText}>Undo</ThemedText>
            </TouchableOpacity>
          )}
          {blendingComplete && (
            <ThemedText style={styles.successText}>
              Blending complete! The result should be visible in the image
              above.
            </ThemedText>
          )}
          {error && (
            <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
          )}
          <ThemedView style={styles.promptContainer}>
            <TextInput
              style={inputStyle}
              onChangeText={setPrompt}
              value={prompt}
              placeholder="Enter your prompt for the selected area"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              multiline={true}
              numberOfLines={3}
            />
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateAIContent}
              disabled={isLoading}
            >
              <ThemedText style={styles.generateButtonText}>
                {isLoading ? 'Generating...' : 'Generate AI Content'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={async () => {
                if (image && enclosingShape) {
                  try {
                    const faceSwappedImageUrl = await sendFaceSwapRequest(
                      viewShotRef
                    );
                    if (faceSwappedImageUrl) {
                      setGeneratedImage(faceSwappedImageUrl);
                      setBlendingComplete(true);
                    } else {
                      setError('Failed to generate face-swapped image');
                    }
                  } catch (error) {
                    console.error('Error capturing image:', error);
                    setError('Failed to capture image');
                  }
                } else if (!image) {
                  setError('No image to save');
                } else {
                  setError('No enclosing shape drawn');
                }
              }}
            >
              <ThemedText style={styles.saveButtonText}>
                Save Image with Shape
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
