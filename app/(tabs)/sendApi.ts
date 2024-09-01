import { Alert, Image } from 'react-native';
import Constants from 'expo-constants';
import { ACCEPTABLE_ERRORS } from './constants';

export const sendFaceSwapRequest = async (
  capturedBase64: string,
  greenColorCode: string,
  originalBase64: string
) => {
  try {
    const formData = new FormData();
    formData.append('face_image', {
      uri: Image.resolveAssetSource(require('../../assets/face_image.jpg')).uri,
      type: 'image/jpeg',
      name: 'face_image.jpg',
    } as any);

    formData.append('input_image', capturedBase64);
    formData.append('original_input_image', originalBase64);
    formData.append('greenColorCode', greenColorCode);

    const apiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (!apiUrl) throw new Error('API_URL is not defined in app config');

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } else {
      const errorText = await response.text();
      if (ACCEPTABLE_ERRORS.includes(errorText)) {
        Alert.alert('Error', errorText);
      }
      throw new Error(
        `Face swap request failed: ${response.status} ${errorText}`
      );
    }
  } catch (error) {
    console.error('Error in face swap request:', error);
    return null;
  }
};
