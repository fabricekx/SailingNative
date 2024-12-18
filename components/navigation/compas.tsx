import React, { useState, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { Magnetometer, Accelerometer } from 'expo-sensors';

// Typage manuel des données des capteurs
interface SensorData {
  x: number;
  y: number;
  z: number;
}

interface CompasProps {
  onHeadingChange: (heading: number | null) => void; // props qui sera transmise au parent
}

const Compas: React.FC<CompasProps> = ({ onHeadingChange }) => {
  const [heading, setHeading] = useState<number | null>(null); // État pour le cap moyen
  const valuesRef = useRef<number[]>([]); // Stocke les valeurs sans re-rendu

  // Fonction pour calculer le cap corrigé
  const calculateHeading = (magnetometerData: SensorData, accelerometerData: SensorData): number | null => {
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
    const Xh = mx * cosPitch + my * sinRoll * sinPitch + mz * cosRoll * sinPitch;
    const Yh = my * cosRoll - mz * sinRoll;
  
    // Étape 3 : Calcul de l'angle du cap magnétique
    const headingRad = Math.atan2(Yh, Xh);
    let headingDeg = (headingRad * 180) / Math.PI; // Conversion en degrés
  
    // Normaliser l'angle dans la plage [0, 360)
    headingDeg = (headingDeg + 360) % 360;
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
    let magnetometerData: SensorData = { x: 0, y: 0, z: 0 };
    let accelerometerData: SensorData = { x: 0, y: 0, z: 0 };

    // Abonnement au magnétomètre
    const magnetometerSubscription = Magnetometer.addListener((data) => {
      magnetometerData = data;
    });

    // Abonnement à l'accéléromètre
    const accelerometerSubscription = Accelerometer.addListener((data) => {
      accelerometerData = data;
    });

    // Interval pour calculer la moyenne toutes les secondes
    const interval = setInterval(() => {
      const correctedHeading = calculateHeading(magnetometerData, accelerometerData);

      if (correctedHeading !== null) {
        valuesRef.current.push(correctedHeading);

        if (valuesRef.current.length > 4) {
          valuesRef.current.shift(); // Garde uniquement les 5 dernières valeurs
        }

        const average =calculateMeanHeading(valuesRef.current);

        let  roundedAverage = parseFloat(average.toFixed(1));
        // normalisation:
        roundedAverage= (roundedAverage+360) % 360 
        setHeading(roundedAverage);

           // Notifier le parent avec onHeadingChange
           onHeadingChange(roundedAverage);
      }
    }, 200);

    // Nettoyage des abonnements et intervalle
    return () => {
      magnetometerSubscription.remove();
      accelerometerSubscription.remove();
      clearInterval(interval);
    };
  }, [onHeadingChange]);

  // Transmet le cap moyen via la props onHeadingChange
  useEffect(() => {
    onHeadingChange(heading);
  }, [heading, onHeadingChange]);
  return  (
    <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
      <Text className="text-xl text-blue-800 dark:text-blue-400">
        Cap compas : 
      </Text>
      <Text className="text-5xl text-black dark:text-slate-400">
        {heading !== null ? `${heading.toFixed(0)}°` : 'Calcul en cours...'}</Text>
    </View>
  );
};

export default Compas;
