import { useRef } from 'react';
import { PanResponder } from 'react-native';

export const usePanResponder = ({ setEnclosingShape, setScrollEnabled }) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        setScrollEnabled(false); // Disable scrolling when drawing starts
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `M${locationX},${locationY}`;
        setEnclosingShape(newPath);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPoint = `L${locationX},${locationY}`;
        setEnclosingShape((prevShape) => prevShape + newPoint);
      },
      onPanResponderRelease: () => {
        setScrollEnabled(true); // Re-enable scrolling when drawing ends
        setEnclosingShape((prevShape) => prevShape + ' Z'); // Close the path
      },
    })
  ).current;

  return { panResponder };
};
