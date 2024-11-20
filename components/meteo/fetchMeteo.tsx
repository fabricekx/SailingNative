import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import WindChart from "./windChart";
import WindChart2 from "./windChart2";
import WeatherTable from "./weatherTable";

const FetchMeteo = ({ latitude, longitude }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (latitude && longitude) {
        setLoading(true);
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=wind_direction_10m,wind_gusts_10m,temperature_2m&hourly=wind_speed_10m,rain,wind_direction_10m,wind_gusts_10m,temperature_2m&wind_speed_unit=kn&timezone=Europe%2FBerlin&forecast_days=3&models=meteofrance_seamless`;
          
          const response = await fetch(url);
          const data = await response.json();
          setWeatherData(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des données météo:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWeatherData();
  }, [latitude, longitude]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView className=" w-full min-h-[400]"
   >
      {weatherData ? (
        <View style={styles.chartContainer}>
          <WeatherTable weatherData={weatherData} />
        </View>
      ) : (
        <Text>Sélectionnez un emplacement pour voir la météo</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: "center",
  },
  chartContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
export default FetchMeteo;
