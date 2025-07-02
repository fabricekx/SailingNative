import React, { useState, useEffect, useRef, useContext } from "react";
import { Text, View } from "react-native";
import { Magnetometer, Accelerometer } from "expo-sensors";
import { CapContext } from "@/app/capContext";

// Typage manuel des données des capteurs
interface SensorData {
  x: number;
  y: number;
  z: number;
  timestamp?: number; // va permettre de vérifier que les données sont simultanées
}

const Compas1 = () => {
  const { heading, setHeading } = useContext(CapContext);
  const valuesRef = useRef<number[]>([]);
  const [sensorData, setSensorData] = useState<{
    magneto: SensorData;
    accel: SensorData;
  } | null>(null);

  useEffect(() => {
    let lastMagneto: SensorData | null = null;
    let lastAccel: SensorData | null = null;

    const tryUpdate = () => {
      if (lastMagneto && lastAccel) {
        setSensorData({ magneto: lastMagneto, accel: lastAccel });
        lastMagneto = null;
        lastAccel = null;
      }
    };

    const magnetometerSubscription = Magnetometer.addListener((data) => {
      lastMagneto = data;
      tryUpdate();
    });

    const accelerometerSubscription = Accelerometer.addListener((data) => {
      lastAccel = data;
      tryUpdate();
    });

    return () => {
      magnetometerSubscription.remove();
      accelerometerSubscription.remove();
    };
  }, []);

  // Fonction pour calculer le cap corrigé
  const calculateHeading = (
    magnetometerData: SensorData,
    accelerometerData: SensorData
  ): number | null => {
    const { x: mx, y: my, z: mz } = magnetometerData;
    const { x: ax, y: ay, z: az } = accelerometerData;

    // Étape 1 : Calcul des angles d'inclinaison (pitch et roll)
    const pitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az));
    const roll = Math.atan2(ay, az);

    // Étape 2 : Correction du magnétomètre pour compenser l'inclinaison
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const cosRoll = Math.cos(roll);
    const sinRoll = Math.sin(roll);

    // Projeter les composantes magnétiques sur le plan horizontal
    const Xh =
      mx * cosPitch + my * sinRoll * sinPitch + mz * cosRoll * sinPitch;
    const Yh = my * cosRoll - mz * sinRoll;

    // Étape 3 : Calcul de l'angle du cap magnétique

    // Normaliser l'angle dans la plage [0, 360) j'enleve 90 pour l'orientation en paysage et j'ajoute 2.6 pour la déclinaisons
    let headingDeg = (Math.atan2(Yh, Xh) * 180) / Math.PI;
    headingDeg = (headingDeg + 360 - 90 + 2.6) % 360;

    return headingDeg;
  };

  // Pour calculer l'angle moyen, on ne peut pas faire une simple moyenne car les valeurs proches de 0 ou 360 degrés vont fausser la moyenne
  const calculateMeanHeading = (values: number[]): number => {
    let sinSum = 0;
    let cosSum = 0;

    values.forEach((value) => {
      sinSum += Math.sin((value * Math.PI) / 180);
      cosSum += Math.cos((value * Math.PI) / 180);
    });

    const meanSin = sinSum / values.length;
    const meanCos = cosSum / values.length;

    const meanAngle = Math.atan2(meanSin, meanCos) * (180 / Math.PI);

    return (meanAngle + 360) % 360;
  };

  useEffect(() => {
    if (!sensorData) return;

    const heading = calculateHeading(sensorData.magneto, sensorData.accel);
    if (heading !== null) {
      valuesRef.current.push(heading);
      if (valuesRef.current.length > 5) valuesRef.current.shift();

      const avg = calculateMeanHeading(valuesRef.current);
      setHeading(parseFloat(avg.toFixed(1)));
    }
  }, [sensorData]);

  // Transmet le cap moyen via la props onHeadingChange

  return (
    <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
      <Text className="text-xl text-blue-800 dark:text-blue-400">
        Cap compas1 :
      </Text>
      <Text className="text-5xl text-black dark:text-slate-400">
        {heading !== null ? `${heading.toFixed(0)}°` : "Calcul en cours..."}
      </Text>
    </View>
  );
};

export default Compas1;
