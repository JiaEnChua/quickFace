import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

export const saveImage = async (generatedImage: string | null) => {
  if (generatedImage) {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        let uriToSave = generatedImage;
        const asset = await MediaLibrary.createAssetAsync(uriToSave);
        await MediaLibrary.createAlbumAsync('QuickFace', asset, false);
        Alert.alert('Success', 'Image saved to gallery');
      } else {
        Alert.alert(
          'Permission required',
          'Please allow access to save photos'
        );
      }
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  } else {
    Alert.alert('No image', 'There is no edited image to save');
  }
};

export const cleanupTemporaryFiles = async () => {
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
};
