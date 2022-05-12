import React from 'react';
import type {Size} from '@shopify/react-native-skia';
import {Canvas, Circle, Rect} from '@shopify/react-native-skia';

type Props = {
  size: Size;
};

export default function Circles({size}: Props) {
  const {width, height} = size;
  const bg = 'rgb(192, 128, 64)';
  const offset = 50;
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 4;

  const color0 = 'rgb(128, 64, 128)';

  return (
    <Canvas style={{flex: 1}}>
      <Rect x={0} y={0} width={width} height={height} color={bg} />
      <Circle cx={cx} cy={cy - offset} r={r} color={color0} />
    </Canvas>
  );
}
