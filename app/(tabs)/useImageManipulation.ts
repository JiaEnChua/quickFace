import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';
import faceImage from '../../assets/face_image.jpg';

export const useImageManipulation = ({
  image,
  setImage,
  setGeneratedImage,
  setIsLoading,
  setError,
  setBlendingComplete,
}) => {
  const generateImageWithHuggingFace = async (
    prompt: string,
    enclosingShape: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace this with actual Hugging Face API call
      // console.log('Generating image with Hugging Face API');

      const generatedImageUri = Image.resolveAssetSource(faceImage).uri;

      if (!generatedImageUri) {
        throw new Error('Failed to generate image');
      }

      //save image on device
      saveImageOnDevice(generatedImageUri);
    } catch (error) {
      console.error('Error generating image:', error);
      if (error instanceof Error) {
        setError(`Failed to generate image: ${error.message}`);
      } else {
        setError('Failed to generate image: Unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveImageOnDevice = async (capturedUri: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access media library was denied');
        return false;
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(capturedUri);
      await MediaLibrary.createAlbumAsync('MyApp', asset, false);

      console.log('Image with enclosing shape saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving image:', error);
      if (error instanceof Error) {
        setError(`Failed to save image: ${error.message}`);
      } else {
        setError('Failed to save image: Unknown error');
      }
      return false;
    }
  };

  return {
    generateImageWithHuggingFace,
    pickImage,
    saveImageOnDevice,
  };
};
