import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const CANVAS_SIZE = Math.min(SCREEN_WIDTH * 0.8, SCREEN_HEIGHT * 0.4);

export const ACCEPTABLE_ERRORS = [
  'No faces found in the image. Please expand the drawing circle to include a face.',
];

export const GREEN_HIGHLIGHT_COLOR = '#00ff00';
