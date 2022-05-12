import React, {useMemo} from 'react';
import type {Size} from '@shopify/react-native-skia';
import {
  Canvas,
  Path,
  useDerivedValue,
  useClockValue,
} from '@shopify/react-native-skia';
import SimplexNoise from 'simplex-noise';

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
      return [[p0, p1, p2] as const, [p3, p2, p1] as const];
    }).flat(),
  ).flat();
}

const SIMPLEX_FREQ = 5000;
const SIMPLEX_OFFSET = Math.floor(Math.random() * 10000);
const SIMPLEX_AMP = 10;

function pointsToSimplex(clock: number, points: Point[]) {
  return points.map(({x, y}, index) => {
    const noise = new SimplexNoise(SIMPLEX_OFFSET + index);
    const noisePoint = {
      x: SIMPLEX_AMP * noise.noise2D(clock / SIMPLEX_FREQ, 0),
      y: SIMPLEX_AMP * noise.noise2D(0, clock / SIMPLEX_FREQ),
    };
    return {
      x: x + noisePoint.x,
      y: y + noisePoint.y,
    };
  });
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
  const clock = useClockValue();

  const points = useMemo(() => createPoints(size), [size]);
  const pointsSimplex = useDerivedValue(
    () => pointsToSimplex(clock.current, points),
    [clock],
  );
  const pointsSvg = useDerivedValue(
    () => pointsToSvg(pointsSimplex.current),
    [pointsSimplex],
  );

  const trianglesSvg = useDerivedValue(() => {
    const triangles = createTriangles(pointsSimplex.current);
    return trianglesToSvg(triangles);
  }, [pointsSimplex]);

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
