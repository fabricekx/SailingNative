import React, { useState, useEffect, useContext } from "react";
import { View, Text } from "react-native";
import { Magnetometer, Accelerometer } from "expo-sensors";
import { CapContext } from "@/app/capContext";
import OrientationManager, {
  useDeviceOrientation,
} from "react-native-orientation-manager";

const Compas = () => {
  const [magnetometerData, setMagnetometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [accelerometerData, setAccelerometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const { heading, setHeading } = useContext(CapContext);
  const deviceOrientation = useDeviceOrientation();

  useEffect(() => {
    const magnetometerSubscription =
      Magnetometer.addListener(setMagnetometerData);
    const accelerometerSubscription =
      Accelerometer.addListener(setAccelerometerData);

    return () => {
      magnetometerSubscription.remove();
      accelerometerSubscription.remove();
    };
  }, []);

  const calculateHeading = () => {
    const { x: mx, y: my, z: mz } = magnetometerData;
    const { x: ax, y: ay, z: az } = accelerometerData;

    const roll = Math.atan2(ay, az);
    const pitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az));

    const Xh = mx * Math.cos(pitch) + mz * Math.sin(pitch);
    const Yh =
      mx * Math.sin(roll) * Math.sin(pitch) +
      my * Math.cos(roll) -
      mz * Math.sin(roll) * Math.cos(pitch);

    let calculatedHeading = Math.atan2(Yh, Xh) * (180 / Math.PI);

    if (calculatedHeading < 0) {
      calculatedHeading += 360;
    }

    calculatedHeading += 2.6; // Ajustement pour la déclinaison magnétique
    calculatedHeading = calculatedHeading % 360;

    if (deviceOrientation.isLandscape()) {
      calculatedHeading = (calculatedHeading + 90) % 360;
    }

    setHeading(calculatedHeading);
  };

  useEffect(() => {
    const interval = setInterval(calculateHeading, 500);
    return () => clearInterval(interval);
  }, [magnetometerData, accelerometerData, deviceOrientation]);

  return (
    <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
      <Text className="text-xl text-blue-800 dark:text-blue-400">
        Cap compas :
      </Text>
      <Text className="text-5xl text-black dark:text-slate-400">
        {heading !== null ? `${heading.toFixed(0)}°` : "Calcul en cours..."}
      </Text>
    </View>
  );
};

export default Compas;
