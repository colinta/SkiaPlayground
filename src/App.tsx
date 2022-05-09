import React, {useState} from 'react';
import {View} from 'react-native';
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
      {Boolean(size) && <Playground size={size} />}
    </View>
  );
}
