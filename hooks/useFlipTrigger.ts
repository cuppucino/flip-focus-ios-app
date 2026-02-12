import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

export const useFlipTrigger = () => {
  const [isFaceDown, setIsFaceDown] = useState(false);
  const isFaceDownRef = useRef(false);

  // Sync ref with state effectively
  useEffect(() => {
    isFaceDownRef.current = isFaceDown;
  }, [isFaceDown]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(500);

    const subscription = Accelerometer.addListener(({ z }) => {
      // Inverted logic based on user feedback:
      // Assuming Face Down corresponds to z > 0.9 on this device/configuration
      if (z > 0.9) {
        if (!isFaceDownRef.current) {
          // Trigger start (Face Down)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsFaceDown(true);
        }
      } else if (z < 0.8) {
        if (isFaceDownRef.current) {
          // Trigger stop/pause (Face Up or Tilted)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setIsFaceDown(false);
        }
      }
    });

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  return isFaceDown;
};
