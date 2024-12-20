import React from "react";
import { useState } from "react";
import { StyleSheet, View, ScrollView, Dimensions, Text } from "react-native";
import ClickableMap from "components/meteo/clickableMap";
import FetchMeteo from "components/meteo/fetchMeteo";

const Meteo = () => {
  const [coordinates, setCoordinates] = useState({
    latitude: 43.537,
    longitude: 7.0355,
  });
  const [windData, setWindData]= useState(null);
  const handleLocationSelect = (latitude, longitude) => {
    setCoordinates({ latitude, longitude });
  };
  const screenHeight = Dimensions.get("window").height;
  return (
    <View  style={{height:screenHeight , alignItems: "center"}}>
      <View style={styles.container}>
        <ClickableMap onLocationSelect={handleLocationSelect} />
        <Text className="text-xs  text-slate-900 dark:text-slate-600">Origine Meteo France (Arome/Arpege)</Text>
      </View>
      <FetchMeteo
        latitude={coordinates.latitude}
        longitude={coordinates.longitude}
        // latitude="43"
        // longitude="3"
      />
    </View>
  );
};

export default Meteo;

const styles = StyleSheet.create({
  
  container: {
    width: "100%",
    height: 200, // une hauteur définie pour la carte
  },
});
