import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CircularProgressProps {
  size: number;
  stroke_width: number;
  progress: number; // 0 to 1
  color_start?: string;
  color_end?: string;
  bg_color?: string;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  stroke_width,
  progress,
  color_start = '#6C63FF',
  color_end = '#A78BFA',
  bg_color = 'rgba(255,255,255,0.08)',
  children,
}) => {
  const radius = (size - stroke_width) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const stroke_dashoffset = circumference * (1 - clamped);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="progress_gradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={color_start} />
            <Stop offset="100%" stopColor={color_end} />
          </LinearGradient>
        </Defs>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={bg_color}
          strokeWidth={stroke_width}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progress_gradient)"
          strokeWidth={stroke_width}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={stroke_dashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children}
    </View>
  );
};
