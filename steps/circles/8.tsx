import React, {useEffect, useState} from 'react';
import type {
  Size,
  SkiaValue,
  SkPoint,
  SkiaMutableValue,
} from '@shopify/react-native-skia';
import {
  Group,
  Canvas,
  Circle,
  Rect,
  useDerivedValue,
  useValue,
  runTiming,
  useTouchHandler,
} from '@shopify/react-native-skia';

type Props = {
  size: Size;
};

function randIn(lower: number, upper: number) {
  return Math.round(lower + Math.random() * (upper - lower));
}

function startAnimation(
  value: SkiaMutableValue<number>,
  randColor: () => number,
) {
  runTiming(value, randColor(), {duration: randIn(2000, 4000)}, () => {
    startAnimation(value, randColor);
  });
}

function useRGB(randColor: () => number) {
  const red = useValue(randColor());
  const green = useValue(randColor());
  const blue = useValue(randColor());

  useEffect(() => {
    startAnimation(red, randColor);
    startAnimation(green, randColor);
    startAnimation(blue, randColor);
  }, []);

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

  const bg = useRGB(() => randIn(200, 255));
  const color0 = useRGB(() => randIn(0, 255));
  const color1 = useRGB(() => randIn(0, 255));
  const color2 = useRGB(() => randIn(0, 255));

  // const pressed = useValue<SkPoint>({x: 0, y: 0});
  const [shape, setShape] = useState<'circle' | 'square'>('circle');
  const [locations, setLocations] = useState<
    {x: number; y: number; color: SkiaValue<string>}[]
  >([
    {x: cx, y: cy - offset, color: color0},
    {x: cx - offset, y: cy + offset, color: color1},
    {x: cx + offset, y: cy + offset, color: color2},
  ]);
  const onTouch = useTouchHandler({
    onStart: touch => {
      setLocations(locations => {
        const nearest = locations.reduce((prev, location) => {
          if (!prev) {
            return location;
          }
          const {x, y} = location;

          const prevDistance =
            Math.abs(touch.x - prev.x) ** 2 + Math.abs(touch.y - prev.y) ** 2;
          const distance =
            Math.abs(touch.x - location.x) ** 2 +
            Math.abs(touch.y - location.y) ** 2;
          return distance < prevDistance ? location : prev;
        });
        return locations.map(location =>
          nearest === location
            ? {x: touch.x, y: touch.y, color: location.color}
            : location,
        );
      });
      // setShape(current => (current === 'circle' ? 'square' : 'circle'));
    },
    onActive: touch => {
      setLocations(locations => {
        const nearest = locations.reduce((prev, location) => {
          if (!prev) {
            return location;
          }
          const {x, y} = location;

          const prevDistance =
            Math.abs(touch.x - prev.x) ** 2 + Math.abs(touch.y - prev.y) ** 2;
          const distance =
            Math.abs(touch.x - location.x) ** 2 +
            Math.abs(touch.y - location.y) ** 2;
          return distance < prevDistance ? location : prev;
        });
        return locations.map(location =>
          nearest === location
            ? {x: touch.x, y: touch.y, color: location.color}
            : location,
        );
      });
      // setShape(current => (current === 'circle' ? 'square' : 'circle'));
    },
  });

  function renderShape({
    cx,
    cy,
    color,
  }: {
    cx: number;
    cy: number;
    color: SkiaValue<string>;
  }) {
    if (shape === 'circle') {
      return <Circle cx={cx} cy={cy} r={r} color={color} />;
    } else {
      const x = cx - r,
        y = cy - r;
      return <Rect x={x} y={y} width={r * 2} height={r * 2} color={color} />;
    }
  }

  return (
    <Canvas style={{flex: 1}} onTouch={onTouch}>
      <Rect x={0} y={0} width={width} height={height} color={bg} />
      <Group blendMode="multiply">
        {locations.map(({x, y, color}) => renderShape({cx: x, cy: y, color}))}
      </Group>
    </Canvas>
  );
}
