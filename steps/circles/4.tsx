import React from 'react';
import type {Size} from '@shopify/react-native-skia';
import {Group, Canvas, Circle, Rect} from '@shopify/react-native-skia';

type Props = {
  size: Size;
};

function randColor(lower: number) {
  return Math.round(lower + Math.random() * (255 - lower));
}

function useRGB(randColor: () => number) {
  const red = randColor();
  const green = randColor();
  const blue = randColor();

  return `rgb(${red}, ${green}, ${blue})`;
}

export default function Circles({size}: Props) {
  const {width, height} = size;
  const offset = 50;
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 4;

  const bg = useRGB(() => randColor(200));
  const color0 = useRGB(() => randColor(200));
  const color1 = useRGB(() => randColor(200));
  const color2 = useRGB(() => randColor(200));

  return (
    <Canvas style={{flex: 1}}>
      <Rect x={0} y={0} width={width} height={height} color={bg} />
      <Group blendMode="multiply">
        <Circle cx={cx} cy={cy - offset} r={r} color={color0} />
        <Circle cx={cx - offset} cy={cy + offset} r={r} color={color1} />
        <Circle cx={cx + offset} cy={cy + offset} r={r} color={color2} />
      </Group>
    </Canvas>
  );
}
