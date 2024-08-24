import { StyleSheet } from 'react-native';
import { CANVAS_SIZE } from './constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    marginBottom: 20,
    position: 'relative',
  },
  canvas: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pickImageButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  pickImageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  promptContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
  },
  input: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    color: '#000',
    backgroundColor: '#fff',
  },
  generateButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  undoButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  undoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  greenScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00ff00', // Bright green color
  },
  successText: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
