import React, {useState} from 'react';
import {View} from 'react-native';
import {Canvas} from '@shopify/react-native-skia';
import Playground from './Playground';

type Size = {
  width: number;
  height: number;
};

export default function App() {
  const [size, setSize] = useState<Size>({width: 0, height: 0});

  return (
    <View
      style={{flex: 1}}
      onLayout={({
        nativeEvent: {
          layout: {width, height},
        },
      }) => setSize({width, height})}>
      <Canvas style={{flex: 1}}>
        {Boolean(size) && <Playground size={size} />}
      </Canvas>
    </View>
  );
}
