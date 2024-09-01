import { Image } from 'react-native';
import { saveImage } from '@/utils';
import faceImage from '../../assets/face_image.jpg';

export const useImageManipulation = ({ setIsLoading, setError }) => {
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
      saveImage(generatedImageUri);
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

  return {
    generateImageWithHuggingFace,
  };
};
