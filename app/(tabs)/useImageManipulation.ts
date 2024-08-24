import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';
import elonImage from '../../assets/elon.png';

export const useImageManipulation = ({
  image,
  setImage,
  setGeneratedImage,
  setIsLoading,
  setError,
  setBlendingComplete,
}) => {
  const blendImages = async (
    aiGeneratedImage: string,
    enclosingShape: string
  ) => {
    if (!image || !aiGeneratedImage) {
      console.error('Missing image or AI generated image');
      setError('Missing image or AI generated image');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBlendingComplete(false);
    try {
      // Parse the enclosing shape to get the bounding box
      const points = enclosingShape
        .slice(1, -2) // Remove 'M' at start and 'Z' at end
        .split('L')
        .map((point) => {
          const [x, y] = point.split(',').map(Number);
          return { x, y };
        });
      console.log('Points:', points.length);

      if (points.length < 2) {
        throw new Error(
          `Invalid enclosing shape: not enough points, points: ${points}, enclosingShape: ${enclosingShape}`
        );
      }

      const minX = Math.min(...points.map((p) => p.x));
      const minY = Math.min(...points.map((p) => p.y));
      const maxX = Math.max(...points.map((p) => p.x));
      const maxY = Math.max(...points.map((p) => p.y));

      const width = Math.max(10, Math.round(maxX - minX)); // Ensure minimum width of 10
      const height = Math.max(10, Math.round(maxY - minY)); // Ensure minimum height of 10

      console.log('Width:', width, 'Height:', height);

      // Resize the AI-generated image
      const resizedAIImage = await ImageManipulator.manipulateAsync(
        aiGeneratedImage,
        [{ resize: { width, height } }],
        { format: 'png' }
      );

      // Get the dimensions of the original image
      const getImageSize = (uri: string) => {
        return new Promise<{ width: number; height: number }>(
          (resolve, reject) => {
            Image.getSize(
              uri,
              (width, height) => resolve({ width, height }),
              (error) => reject(error)
            );
          }
        );
      };

      // Use extend to place the resized AI-generated image on a canvas of the original image size
      // const extendedImage = await ImageManipulator.manipulateAsync(
      //   resizedAIImage.uri,
      //   [
      //     {
      //       extend: {
      //         top: minY,
      //         bottom: originalImageSize.height - (minY + height),
      //         left: minX,
      //         right: originalImageSize.width - (minX + width),
      //         backgroundColor: 'transparent',
      //       },
      //     },
      //   ],
      //   { format: 'png' }
      // );

      // console.log(
      //   'Blending complete. New generated image set to:',
      //   extendedImage.uri
      // );

      setGeneratedImage(resizedAIImage.uri);
      setBlendingComplete(true);
    } catch (error) {
      console.error('Error blending images:', error);
      setError('Failed to blend images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateImageWithHuggingFace = async (
    prompt: string,
    enclosingShape: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace this with actual Hugging Face API call
      // console.log('Generating image with Hugging Face API');

      const generatedImageUri = Image.resolveAssetSource(elonImage).uri;
      console.log('generatedImageUri: ', generatedImageUri);

      if (!generatedImageUri) {
        throw new Error('Failed to generate image');
      }

      try {
        await blendImages(generatedImageUri, enclosingShape);
      } catch (error) {
        console.error('Error during image manipulation:', error);
        throw error;
      }
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

  return {
    blendImages,
    generateImageWithHuggingFace,
    pickImage,
  };
};
