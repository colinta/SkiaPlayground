import React, {useMemo} from 'react';
import type {Size} from '@shopify/react-native-skia';
import {Canvas, Path} from '@shopify/react-native-skia';

const POINTS = 5;

const palette = [
  '#61dafb',
  '#fb61da',
  '#dafb61',
  '#61fbcf',
  '#cf61fb',
  '#fbcf61',
  '#61dacf',
  '#cf61da',
  '#dacf61',
];

interface Point {
  x: number;
  y: number;
}

function createPoints(size: Size): Point[] {
  const sizeX = size.width / POINTS;
  const sizeY = size.height / POINTS;
  const N = [...Array(POINTS + 1).keys()];
  return N.map(nx => N.map(ny => ({x: nx * sizeX, y: ny * sizeY}))).flat();
}

const SVG = {
  move(p: Point) {
    return `M${p.x} ${p.y}`;
  },
  line(p: Point) {
    return `L${p.x} ${p.y}`;
  },
  close() {
    return `Z`;
  },
};

function pointsToSvg(points: Point[]) {
  return points
    .map(({x, y}) => {
      const p0 = {x: x - 5, y: y - 5};
      const p1 = {x: x + 5, y: y - 5};
      const p2 = {x: x + 5, y: y + 5};
      const p3 = {x: x - 5, y: y + 5};
      return [
        SVG.move(p0),
        SVG.line(p1),
        SVG.line(p2),
        SVG.line(p3),
        SVG.close(),
      ].join(' ');
    })
    .join('');
}

interface Props {
  size: Size;
}

export default function Mesh({size}: Props) {
  const points = useMemo(() => createPoints(size), [size]);
  const pointsSvg = useMemo(() => pointsToSvg(points), [points]);

  return (
    <Canvas style={{flex: 1}}>
      <Path path={pointsSvg} color={palette[1]} />
    </Canvas>
  );
}
