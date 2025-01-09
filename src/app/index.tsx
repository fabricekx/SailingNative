import { Link, Redirect } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { appConfig } from 'ts/appConfig';
import Config from 'ts/config';

export default function Page() {
  useEffect(() => {
    // Charger la configuration depuis AsyncStorage au démarrage
    const loadConfig = async () => {
      const loadedConfig = await Config.loadFromStorage();
      Object.assign(appConfig, loadedConfig); // Met à jour l'instance globale
    };
    loadConfig();
  }, []);
  return (
<Redirect href="/(tabs)/meteo"/>
  )
}

