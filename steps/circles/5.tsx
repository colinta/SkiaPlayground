import React from 'react';
import type {Size} from '@shopify/react-native-skia';
import {
  Group,
  Canvas,
  Circle,
  Rect,
  useDerivedValue,
  useValue,
} from '@shopify/react-native-skia';

type Props = {
  size: Size;
};

function randColor(lower: number) {
  return Math.round(lower + Math.random() * (255 - lower));
}

function useRGB(randColor: () => number) {
  const red = useValue(randColor());
  const green = useValue(randColor());
  const blue = useValue(randColor());

  return useDerivedValue(
    () => `rgb(${red.current}, ${green.current}, ${blue.current})`,
    [red, green, blue],
  );
}

export default function Circles({size}: Props) {
  const {width, height} = size;
  const offset = 50;
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 4;

  const bg = useRGB(() => randColor(200));
  const color0 = 'rgb(128, 64, 128)';
  const color1 = 'rgb(64, 128, 128)';
  const color2 = 'rgb(128, 128, 64)';

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
