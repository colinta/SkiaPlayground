import React from 'react';
import {Dimensions} from 'react-native';
import type {SkiaValue} from '@shopify/react-native-skia';
import {
  mix,
  rect,
  rrect,
  Canvas,
  Fill,
  useValue,
  useTouchHandler,
  runTiming,
  useDerivedValue,
  Rect,
} from '@shopify/react-native-skia';

type RGB = [number, number, number];
type RGBA = [number, number, number, number];

const Theme = {
  whiteBackground: [240, 240, 243] as RGB,
  shadowLight: [174, 174, 192] as RGB,
};

function rgb([r, g, b]: RGB) {
  return `rgb(${r}, ${g}, ${b})`;
}

function rgba([r, g, b, a]: RGBA | RGB, a0?: number) {
  return `rgba(${r}, ${g}, ${b}, ${a0 ?? a})`;
}

function rgbMix(normal: number, color0: RGB | RGBA, color1: RGB | RGBA) {
  const r = Math.floor(mix(normal, color0[0], color1[0]));
  const g = Math.floor(mix(normal, color0[1], color1[1]));
  const b = Math.floor(mix(normal, color0[2], color1[2]));
  if (color0[3] !== undefined && color1[3] !== undefined) {
    const a = mix(normal, color0[3] ?? 1, color1[3] ?? 1);
    return rgba([r, g, b, a]);
  }
  return rgb([r, g, b]);
}

export default function Neumorphism() {
  const pressed = useValue(0);
  const onTouch = useTouchHandler({
    onStart: () => {
      runTiming(pressed, pressed.current > 0.5 ? 0 : 1, {duration: 150});
    },
  });

  return (
    <Canvas style={{flex: 1}} onTouch={onTouch}>
      <Fill color={rgb(Theme.whiteBackground)} />
      <Switch pressed={pressed} />
    </Canvas>
  );
}

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const PADDING = 8;
const width = screenWidth - PADDING * 2;
const height = screenHeight / 2;
const x = PADDING;
const y = (screenHeight - height) / 2;

const FRAME_SRC = rect(0, 0, 48, 24);
const FRAME_DST = rect(x, y, width, height);
const border = rrect(FRAME_SRC, 12, 12);
const container = rrect(rect(1, 1, 46, 22), 12, 12);
const dot = rrect(rect(6, 6, 12, 12), 12, 12);

interface SwitchProps {
  pressed: SkiaValue<number>;
}

const Switch = ({pressed}: SwitchProps) => {
  const background = useDerivedValue(() => {
    return rgbMix(pressed.current, Theme.whiteBackground, Theme.shadowLight);
  }, [pressed]);

  return <Rect rect={FRAME_DST} color={background} />;
};
