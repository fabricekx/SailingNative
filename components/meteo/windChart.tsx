import React, { useState } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import SelectList from "components/usefull/selectList";

const WindChart = ({ weatherData }) => {
  const screenWidth = Dimensions.get("window").width;

  // État pour le tooltip
  const [tooltip, setTooltip] = useState(null);

  // Transformation des données
  const labels = weatherData.hourly.time.map((time) => {
    const [date, hour] = time.split("T");
    const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
    return hour.slice(0, 2) === "00" ? formattedDate : hour.slice(0, 2);
  });

  const [unit, setUnit] = useState("Noeuds");
  const windSpeedData = weatherData.hourly.wind_speed_10m.map((speed) =>
    unit === "Noeuds" ? speed : Math.round(speed * 1.852)
  );

  // Gestion du changement d'unité
  const changeUnit = (selectedUnit) => {
    setUnit(selectedUnit);
  };

  // Fonction pour détecter le clic sur le graphique
  const handlePress = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    // Dimensions du graphique
    const chartWidth = labels.length * 25;
    const chartHeight = 250;

    // Calcul de l'index correspondant au clic
    const index = Math.floor((locationX / chartWidth) * labels.length);
    if (index >= 0 && index < windSpeedData.length) {
      setTooltip({
        x: locationX,
        y: locationY,
        label: labels[index],
        value: windSpeedData[index],
      });
    } else {
      setTooltip(null); // Si hors graphique, on masque le tooltip
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        {/* Sélecteur d'unité */}
        <SelectList
          style={styles.selectList}
          options={["Noeuds", "Km/h"]}
          onSelect={changeUnit}
          label="Unité de vitesse"
          defaultValue="Noeuds"
        />

        {/* Graphique scrollable */}
        <ScrollView horizontal>
          <View>
            <LineChart
              data={{
                labels,
                datasets: [
                  {
                    data: windSpeedData,
                    color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={labels.length * 25}
              height={250}
              yAxisSuffix={unit === "Noeuds" ? " Nds" : " Km/h"}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#eff3ff",
                backgroundGradientTo: "#efefef",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: "0", // Points masqués
                },
              }}
              bezier
              style={styles.chart}
            />

            {/* Tooltip */}
            {tooltip && (
              <View
                style={[
                  styles.tooltip,
                  {
                    top: tooltip.y - 40, // Ajuste la position
                    left: tooltip.x - 30,
                  },
                ]}
              >
                <Text style={styles.tooltipText}>
                  {tooltip.label}: {tooltip.value} {unit}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  selectList: {
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "white",
    padding: 8,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 12,
    color: "#000",
  },
});

export default WindChart;
