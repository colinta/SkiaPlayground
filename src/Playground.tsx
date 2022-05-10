import React, {useEffect} from 'react';
import {
  Circle,
  Group,
  Rect,
  useValue,
  useDerivedValue,
  runTiming,
  SkiaValue,
} from '@shopify/react-native-skia';

type Clamp = [number, number];

type Size = {
  width: number;
  height: number;
};

type Props = {
  size: Size;
};

function startRandAnimation(
  debug: string,
  count: number,
  value: SkiaValue<number>,
  clamp: Clamp,
  desired: number = 1,
) {
  runTiming(value, desired, {duration: randIn([1000, 2000])}, () => {
    console.log(`generating ${debug} #${count}`);
    startRandAnimation(debug, count + 1, value, clamp, randIn(clamp));
  });
}

function randIn(clamp: Clamp) {
  return Math.floor(clamp[0] + Math.random() * (clamp[1] - clamp[0]));
}

function useRGB(debug: string, clamp: Clamp = [0, 256]) {
  const red = useValue(randIn(clamp));
  const green = useValue(randIn(clamp));
  const blue = useValue(randIn(clamp));
  const rgb = useDerivedValue(
    () => `rgb(${red.current}, ${green.current}, ${blue.current})`,
    [red, green, blue],
  );
  useEffect(() => {
    startRandAnimation(`${debug}-red`, 0, red, clamp, red.current);
    startRandAnimation(`${debug}-green`, 0, green, clamp, green.current);
    startRandAnimation(`${debug}-blue`, 0, blue, clamp, blue.current);
  }, []);

  return rgb;
}

export default function Playground({size}: Props) {
  const {width, height} = size;
  const cx = width / 2;
  const cy = height / 2;
  const d = 50;
  const r = Math.min(width, height) / 4;

  // animate one circle's colors
  const rgb0 = useRGB('top', [0, 256]);
  const rgb1 = useRGB('left', [64, 256]);
  const rgb2 = useRGB('right', [128, 256]);
  const bg = useRGB('background', [192, 256]);

  return (
    <>
      <Rect x={0} y={0} width={width} height={height} color={bg} />
      <Group blendMode="multiply">
        <Circle cx={cx} cy={cy - d} r={r} color={rgb0} />
        <Circle cx={cx - d} cy={cy + d} r={r} color={rgb1} />
        <Circle cx={cx + d} cy={cy + d} r={r} color={rgb2} />
      </Group>
    </>
  );
}
