import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import MapView from 'react-native-maps';
import { Area, CartesianChart, Line, useChartPressState } from "victory-native";
import { Circle, LinearGradient, useFont, vec } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import inter from "assets/fonts/Poppins-Medium.ttf";

function MyChart() {
  const font = useFont(inter, 12);
  const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0} });

  return (
    <View style={{ height: 300 }}>
      <CartesianChart
        data={DATA}
        xKey="day"
        yKeys={["highTmp"]}
        axisOptions={{
          font,
        }}
        chartPressState={state}
      >
        {({ points, chartBounds }) => (
          <>
            <Line points={points.highTmp} color="red" strokeWidth={3} 
            animate={{ type: "timing", duration: 500}}/>
            <Area points={points.highTmp} y0={chartBounds.bottom}>
            <LinearGradient start={vec(chartBounds.bottom,200)} 
            end={vec(chartBounds.bottom,chartBounds.bottom)}
            colors={['#4c669f', '#3b5998', '#192f6a']}/>
            </Area>
            {isActive && (
              <ToolTip x={state.x.position} y={state.y.highTmp.position} />
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
}

function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
  return <Circle cx={x} cy={y} r={8} color="black" />;
}

const DATA = Array.from({ length: 31 }, (_, i) => ({
  day: i,
  highTmp: 40 + 30 * Math.random(),
}));

const Navigation = () => {



  return (
    <View>
    <View className="w-[400] flex justify-center h-[250] px-4 my-6">
      <Text style={styles.text}>Navigation...</Text>
      <MapView style={styles.map}
      initialRegion={{
        latitude: 43.537, // Exemple: Paris
        longitude:  7.0355,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }} />
      
    </View>
    <View className="w-[400] flex justify-center h-[250] px-4 my-6">
<MyChart></MyChart>
    </View>
    </View>
  );
};

export default Navigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  coordinates: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
});
