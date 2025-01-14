import { Link, Redirect } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { appConfig } from 'ts/appConfig';
import Config from 'ts/config';
import { loadAppConfig } from "ts/appConfig";


export default function Page() {
  useEffect(() => {
    loadAppConfig(); // Appelle simplement la méthode centralisée
  }, []);
  return (
<Redirect href="/(tabs)/meteo"/>
  )
}

