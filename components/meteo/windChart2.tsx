// Devrait mieux fonctionner avec le tooltip, mais probème avec reanimated
import React, { useState } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { Area, CartesianChart, Line, useChartPressState } from "victory-native";
import { LinearGradient, useFont, vec, Circle } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";

import SelectList from "components/usefull/selectList";
import inter from "assets/fonts/Poppins-Medium.ttf";

const WindChart2 = ({ weatherData }) => {
  const screenWidth = Dimensions.get("window").width;
  const font = useFont(inter, 12);
  const { state, isActive } = useChartPressState({ x: 0, y: { speed: 0 } });

  // Transformation des labels
  const labels = weatherData.hourly.time.map((time) => {
    const [date, hour] = time.split("T");
    const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
    return hour.slice(0, 2) === "00" ? formattedDate : hour.slice(0, 2);
  });

  // Gestion des unités
  const [unit, setUnit] = useState("Noeuds");
  const windSpeedData = weatherData.hourly.wind_speed_10m.map((speed) =>
    unit === "Noeuds" ? speed : speed * 1.852
  );
  const windGustsData = weatherData.hourly.wind_gusts_10m.map((gust) =>
    unit === "Noeuds" ? gust : gust * 1.852
  );
  const rainData = weatherData.hourly.rain;

  // Réorganisation des données pour Victory
  const reorganizeDataForVictory = (labels, speed, gust, rain) => {
    if (!labels || !speed || !gust || !rain) {
      throw new Error("Toutes les données doivent être fournies.");
    }
    if (
      labels.length !== speed.length ||
      labels.length !== gust.length ||
      labels.length !== rain.length
    ) {
      throw new Error("Tous les tableaux doivent avoir la même longueur.");
    }

    return labels.map((label, index) => ({
      label,
      speed: speed[index],
      gust: gust[index],
      rain: rain[index],
    }));
  };

  const DATA = reorganizeDataForVictory(labels, windSpeedData, windGustsData, rainData);
  // Fonction pour changer l'unité
  const changeUnit = (selectedUnit) => {
    setUnit(selectedUnit);
  };
  function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
    return <Circle cx={x} cy={y} r={8} color="black" />;
  }
  return (
    <View className="flex-1 p-4">
      {/* SelectList pour changer l'unité */}
      <SelectList
        className="w-full mb-4"
        options={["Noeuds", "Km/h"]}
        onSelect={changeUnit}
        label="Unité de vitesse"
        defaultValue="Noeuds"
      />

      {/* Graphique scrollable */}
      <ScrollView 
      horizontal
      contentContainerStyle={{ flexGrow: 1,
       justifyContent: "center" ,
       backgroundColor: "rgba(0, 0, 255, 0.1)", // Debug
       }}
>
        <CartesianChart
            style={{ width: screenWidth * 2, height: 300 }}

          data={DATA}
          xKey="label"
          yKeys={["speed","gust"]}
          axisOptions={{
            font,
          }}
          chartPressState={state}
        >
          {({ points, chartBounds }) => (
            <>
              <Line
                points={points.speed}
                color="blue"
                strokeWidth={3}
                animate={{ type: "timing", duration: 500 }}
              />
              <Area points={points.speed} y0={chartBounds.bottom}>
                <LinearGradient
                  start={vec(chartBounds.bottom, 200)}
                  end={vec(chartBounds.bottom, chartBounds.bottom)}
                  colors={["#4c669f", "#3b5998", "#192f6a"]}
                />
              </Area>
              <Line
                points={points.gust}
                color="red"
                strokeWidth={2}
                animate={{ type: "timing", duration: 500 }}
              />
              {isActive && (
                <ToolTip x={state.x.position} y={state.y.speed.position} />
              )}
            </>
          )}
        </CartesianChart>
      </ScrollView>
    </View>
  );
};

export default WindChart2;
