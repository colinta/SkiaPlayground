import React from 'react';
import {Canvas, Fill} from '@shopify/react-native-skia';

type RGB = [number, number, number];
type RGBA = [number, number, number, number];

const Theme = {
  whiteBackground: [240, 240, 243] as RGB,
};

function rgb([r, g, b]: RGB) {
  return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}

export default function Neumorphism() {
  return (
    <Canvas style={{flex: 1}}>
      <Fill color={rgb(Theme.whiteBackground)} />
    </Canvas>
  );
}
