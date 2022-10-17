import React, {useEffect, useMemo, useState} from 'react';
import Geolocation from '@react-native-community/geolocation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {interpolate, Size} from '@shopify/react-native-skia';
import {
  useFont,
  Canvas,
  Line,
  Rect,
  Circle,
  Text,
  useTouchHandler,
  useValue,
  rect,
  vec,
} from '@shopify/react-native-skia';
import type {SkFont} from '@shopify/react-native-skia';
import type {Result} from './Result';
import {success, failure} from './Result';
import type {Category, Optional} from './types';
import type {Main} from './WeatherAPI';
import {fetchOneCall} from './WeatherAPI';

const DEFAULTS = {
  displayMin: 273.15,
  coolStart: 278,
  hotStart: 299,
  displayMax: 303.15,
  coolColor: [0x28, 0x7f, 0xff],
  hotColor: [0xff, 0x28, 0x2b],
} as const;

const ONE_SECOND = 1000;
const TO_DT = ONE_SECOND;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;

function hex(value: number): string {
  if (value < 0) {
    return hex(0);
  }
  if (value > 255) {
    return hex(255);
  }
  return Math.round(value).toString(16).padStart(2, '0');
}

function temperatureColor(value: number): string {
  const coolR = interpolate(
    value,
    [DEFAULTS.coolStart, DEFAULTS.hotStart],
    [DEFAULTS.coolColor[0], DEFAULTS.hotColor[0]],
  );
  const coolG = interpolate(
    value,
    [DEFAULTS.coolStart, DEFAULTS.hotStart],
    [DEFAULTS.coolColor[1], DEFAULTS.hotColor[1]],
  );
  const coolB = interpolate(
    value,
    [DEFAULTS.coolStart, DEFAULTS.hotStart],
    [DEFAULTS.coolColor[2], DEFAULTS.hotColor[2]],
  );
  return `#${hex(coolR)}${hex(coolG)}${hex(coolB)}`;
}

function timeY(
  value: number,
  now: number,
  hours: number,
  [nowY, bottom]: [number, number],
) {
  return interpolate(
    value,
    [now / 1000, now / 1000 + 60 * 60 * 24],
    [nowY, bottom],
  );
}

function latitudeLongitudeString(coords: Coords) {
  const latitude = Math.round(coords.latitude * 100) / 100;
  const longitude = Math.round(coords.longitude * 100) / 100;
  return `${latitude}°N, ${longitude}°E`;
}

interface Props {
  size: Size;
}

interface SummaryProps {
  now: number;
  coords?: Result<Coords>;
  weather?: Result<Weather>;
  size: Size;
  bottomInset: number;
}

function mainToCategory(main: Main): Category {
  switch (main) {
    case 'Clear':
      return 'Clear';
    case 'Clouds':
      return 'Clouds';
    case 'Drizzle':
    case 'Rain':
    case 'Squall':
    case 'Thunderstorm':
      return 'Rain';
    case 'Snow':
      return 'Snow';
    case 'Ash':
    case 'Dust':
    case 'Fog':
    case 'Haze':
    case 'Mist':
    case 'Sand':
    case 'Smoke':
      return 'Fog';
    case 'Tornado':
      return 'Other';
  }
}

function useSummary({
  now,
}: {
  now: number;
}): [Optional<Result<Coords>>, Optional<Result<Weather>>] {
  const [coords, setCoords] = useState<Result<Coords>>();
  const [weather, setWeather] = useState<Result<Weather>>();

  useEffect(() => {
    if (!coords?.value) {
      return;
    }

    const {latitude, longitude} = coords.value;

    const intervalId = setInterval(async () => {
      const oneCall = await fetchOneCall({
        latitude,
        longitude,
        now: now,
      });

      setWeather(
        oneCall.map(({current, daily, hourly}) => {
          const nowDt = now / TO_DT;
          const closestDaily = daily.reduce((prev, current) => {
            return Math.abs(current.dt - nowDt) < Math.abs(prev.dt - nowDt)
              ? current
              : prev;
          });

          const [tempMin, tempMax] = hourly.reduce(
            ([tempMin, tempMax], {dt, temp}) => {
              const nextMin = Math.min(tempMin, temp);
              const nextMax = Math.max(tempMax, temp);
              return [nextMin, nextMax];
            },
            [closestDaily.temp.min, closestDaily.temp.max],
          );

          return {
            category: mainToCategory(current.weather[0]?.main),
            min: Math.min(current.temp, closestDaily.temp.min, tempMin),
            max: Math.max(current.temp, closestDaily.temp.max, tempMax),
            displayMin: Math.min(
              DEFAULTS.displayMin,
              current.temp,
              closestDaily.temp.min,
            ),
            displayMax: Math.max(
              DEFAULTS.displayMax,
              current.temp,
              closestDaily.temp.max,
            ),
            hourly: hourly.map(({dt, temp}) => ({
              time: dt,
              temperature: temp,
            })),
          };
        }),
      );
    }, ONE_SECOND * 5);

    return () => {
      clearInterval(intervalId);
    };
  }, [coords]);

  useEffect(() => {
    Geolocation.setRNConfiguration({
      authorizationLevel: 'whenInUse',
    });

    Geolocation.getCurrentPosition(
      async ({coords: {latitude, longitude}}) => {
        setCoords(success({latitude, longitude}));
      },
      () => setCoords(failure(new Error())),
      {enableHighAccuracy: true},
    );
  }, []);

  return [coords, weather];
}

type ErrorMessagesProps = Omit<SummaryProps, 'now'> & {font: SkFont};

function ErrorMessages({
  font,
  size,
  coords,
  weather,
  bottomInset,
}: ErrorMessagesProps) {
  const errors = [];
  if (coords === undefined) {
    errors.push('Fetching location…');
  } else if (!coords.value) {
    errors.push('Could not determine', 'your location');
  } else if (weather === undefined) {
    errors.push(
      `Located at`,
      latitudeLongitudeString(coords.value),
      'Fetching weather…',
    );
  } else if (weather.value === undefined) {
    errors.push('Could not retrieve', 'the weather');
  }

  const bottomMargin = bottomInset > 0 ? 0 : 10;
  const lineHeight = 25;
  const startY =
    size.height - bottomInset - lineHeight * errors.length - bottomMargin;

  return errors.length ? (
    <>
      <Rect
        color="#FF9A9C"
        rect={rect(0, startY, size.width, size.height - startY)}
      />
      {errors.map((line, index) => (
        <Text
          key={`${index}-${line}`}
          x={10}
          y={startY + lineHeight * (index + 1)}
          text={line}
          font={font}
        />
      ))}
      <Line
        p1={vec(0, startY)}
        p2={vec(size.width, startY)}
        color="black"
        style="stroke"
        strokeWidth={2}
      />
    </>
  ) : null;
}

function TemperatureLine({
  temperature,
  display,
  size,
}: {
  temperature?: number;
  display: [number, number];
  size: Size;
}) {
  if (!temperature) {
    return null;
  }

  const textLeft = 100;
  const textRight = size.width - 10;

  const x = interpolate(
    temperature,
    [display[0], display[1]],
    [textLeft, textRight],
  );
  const color = temperatureColor(temperature);

  return (
    <Line
      strokeWidth={1.5}
      color={color}
      p1={vec(x, 0)}
      p2={vec(x, size.height)}
    />
  );
}

function Summary({now, size, coords, weather, bottomInset}: SummaryProps) {
  const font = useFont(require('./hack.ttf'), 20);

  if (!font) {
    return null;
  }

  if (!weather?.value || !coords?.value) {
    return (
      <ErrorMessages
        font={font}
        size={size}
        bottomInset={bottomInset}
        coords={coords}
        weather={weather}
      />
    );
  }

  const textLeft = 100;
  const textRight = size.width - 10;
  const nowY = 120;
  const hours = Math.floor(size.height - nowY) / 25;

  const points = weather.value.hourly.map(({time, temperature}) => {
    const x = interpolate(
      temperature,
      [weather.value.displayMin, weather.value.displayMax],
      [textLeft, textRight],
    );
    const y = timeY(time, now, hours, [nowY, size.height]);
    return {x, y, temperature};
  });
  const dots = points.map(({x, y, temperature}) => {
    return {x, y, color: temperatureColor(temperature)};
  });

  const timeString = 'Now';

  return (
    <>
      {dots.map(({x, y, color}) => {
        return <Circle r={5} c={vec(x, y)} color={color} />;
      })}

      <TemperatureLine
        temperature={weather.value.min}
        display={[weather.value.displayMin, weather.value.displayMax]}
        size={size}
      />
      <TemperatureLine
        temperature={weather.value.max}
        display={[weather.value.displayMin, weather.value.displayMax]}
        size={size}
      />

      <Line
        strokeWidth={1.5}
        color="black"
        p1={vec(0, nowY)}
        p2={vec(size.width, nowY)}
      />
      <Text x={10} y={nowY - 2} text={timeString} font={font} />
    </>
  );
}

function toC(temp: number) {
  return Math.round((temp + 273.15) * 2) / 2;
}

function toF(temp: number) {
  return Math.round(1.8 * (temp - 273.15) + 32);
}

export default function Weather({size}: Props) {
  const now = Date.now();
  const [coords, weather] = useSummary({now});
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;

  return (
    <Canvas style={{flex: 1}}>
      <Summary
        now={now}
        bottomInset={bottomInset}
        size={size}
        coords={coords}
        weather={weather}
      />
    </Canvas>
  );
}

interface Coords {
  latitude: number;
  longitude: number;
}

interface Weather {
  category: Category;
  hourly: {
    time: number;
    temperature: number;
  }[];
  min: number;
  displayMin: number;
  max: number;
  displayMax: number;
}
