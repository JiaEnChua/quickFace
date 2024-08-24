import { useRef } from 'react';
import { PanResponder } from 'react-native';

export const usePanResponder = ({
  pointsRef,
  setPath,
  setIsDrawing,
  setEnclosingShape,
  setScrollEnabled,
}) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        setScrollEnabled(false); // Disable scrolling when drawing starts
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `M${locationX},${locationY}`;
        setPath(newPath);
        setEnclosingShape(newPath);
        pointsRef.current = [{ x: locationX, y: locationY }];
        setIsDrawing(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPoint = `L${locationX},${locationY}`;
        setPath((prevPath) => prevPath + newPoint);
        setEnclosingShape((prevShape) => prevShape + newPoint);
        pointsRef.current.push({ x: locationX, y: locationY });
      },
      onPanResponderRelease: () => {
        setScrollEnabled(true); // Re-enable scrolling when drawing ends
        setIsDrawing(false);
        setEnclosingShape((prevShape) => prevShape + ' Z'); // Close the path
        setPath('');
      },
    })
  ).current;

  return { panResponder };
};
