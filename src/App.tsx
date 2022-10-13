import React, {useState} from 'react';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {Size} from '@shopify/react-native-skia';
// import Schedule from './upnext/Schedule';
import Weather from './weather/Weather';

export default function App() {
  const [size, setSize] = useState<Size>();

  return (
    <SafeAreaProvider>
      <View
        style={{flex: 1}}
        onLayout={({
          nativeEvent: {
            layout: {width, height},
          },
        }) => setSize({width, height})}>
        {size ? <Weather size={size} /> : null}
      </View>
    </SafeAreaProvider>
  );
}
