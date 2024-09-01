import { Alert, Image } from 'react-native';
import Constants from 'expo-constants';

export const sendFaceSwapRequest = async (
  capturedUri: string,
  noGreenMask: boolean,
  originalImage: string
) => {
  try {
    const formData = new FormData();
    formData.append('face_image', {
      uri: Image.resolveAssetSource(require('../../assets/face_image.jpg')).uri,
      type: 'image/jpeg',
      name: 'face_image.jpg',
    } as any);

    formData.append('input_image', {
      uri: capturedUri,
      type: 'image/png',
      name: 'input_image.png',
    } as any);

    formData.append('original_input_image', {
      uri: originalImage,
      type: 'image/png',
      name: 'original_input_image.png',
    } as any);

    formData.append('noGreenMask', noGreenMask.toString());

    const apiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (!apiUrl) throw new Error('API_URL is not defined in app config');

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Response status:', response.status);
    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } else {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(
        `Face swap request failed: ${response.status} ${errorText}`
      );
    }
  } catch (error) {
    console.error('Error in face swap request:', error);
    Alert.alert(
      'Error',
      `Failed to process the face swap request: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    return null;
  }
};
