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

type Triangle = readonly [Point, Point, Point];

function createPoints(size: Size): Point[] {
  const sizeX = size.width / POINTS;
  const sizeY = size.height / POINTS;
  const N = [...Array(POINTS + 1).keys()];
  return N.map(nx => N.map(ny => ({x: nx * sizeX, y: ny * sizeY}))).flat();
}

function createTriangles(points: Point[]): Triangle[] {
  const N = [...Array(POINTS).keys()];
  const atIndex = (nx: number, ny: number) => points[ny + (POINTS + 1) * nx];
  return N.map(nx =>
    N.map(ny => {
      const p0: Point = atIndex(nx, ny);
      const p1: Point = atIndex(nx + 1, ny);
      const p2: Point = atIndex(nx, ny + 1);
      const p3: Point = atIndex(nx + 1, ny + 1);
      return [[p0, p1, p2] as const, [p1, p2, p3] as const];
    }).flat(),
  ).flat();
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

function trianglesToSvg(triangles: Triangle[]) {
  return triangles
    .map(tri =>
      [SVG.move(tri[0]), SVG.line(tri[1]), SVG.line(tri[2]), SVG.close()].join(
        ' ',
      ),
    )
    .join('');
}

interface Props {
  size: Size;
}

export default function Mesh({size}: Props) {
  const points = useMemo(() => createPoints(size), [size]);
  const pointsSvg = useMemo(() => pointsToSvg(points), [points]);

  const trianglesSvg = useMemo(() => {
    const triangles = createTriangles(points);
    return trianglesToSvg(triangles);
  }, [points]);

  return (
    <Canvas style={{flex: 1}}>
      <Path
        path={trianglesSvg}
        color={palette[0]}
        style="stroke"
        strokeWidth={2}
      />
      <Path path={pointsSvg} color={palette[1]} />
    </Canvas>
  );
}
