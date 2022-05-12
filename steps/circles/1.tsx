import React from 'react';
import type {Size} from '@shopify/react-native-skia';
import {Canvas, Rect} from '@shopify/react-native-skia';

type Props = {
  size: Size;
};

export default function Circles({size}: Props) {
  const {width, height} = size;
  const bg = '#fb61da';

  return (
    <Canvas style={{flex: 1}}>
      <Rect x={0} y={0} width={width} height={height} color={bg} />
    </Canvas>
  );
}
