import React, {useEffect, useMemo, useState} from 'react';
import type {Size} from '@shopify/react-native-skia';
import {
  Canvas,
  Line,
  Rect,
  Skia,
  Text,
  useTouchHandler,
  useValue,
  vec,
} from '@shopify/react-native-skia';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface Props {
  size: Size;
}

export default function Weather({size}: Props) {
  console.log('=============== Weather.tsx at line 20 ===============');
  console.log({size});
  return (
    <Canvas style={{flex: 1}}>
      <Line
        p1={vec(0, 0)}
        p2={vec(size.width, size.height)}
        color="black"
        style="stroke"
        strokeWidth={2}
      />
      <Line
        p1={vec(size.width, 0)}
        p2={vec(0, size.height)}
        color="black"
        style="stroke"
        strokeWidth={2}
      />
    </Canvas>
  );
}
