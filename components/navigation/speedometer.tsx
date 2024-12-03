import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import * as Location from 'expo-location';

const Vitesse: React.FC = () => {
  const [speed, setSpeed] = useState<number>(0);
  const [speedValues, setSpeedValues] = useState<number[]>([]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied.');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Mise à jour toutes les secondes
          distanceInterval: 1, // Mise à jour après au moins 1 mètre
        },
        (location) => {
          const speed = location.coords.speed; // En m/s
          if (speed !== null) {
            setSpeedValues((prev) => {
              const updated = [...prev, speed * 3.6]; // Conversion en km/h
              if (updated.length > 5) updated.shift(); // Garder les 5 dernières valeurs
              return updated;
            });
          }
        }
      );
    };

    startTracking();

    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (speedValues.length > 0) {
      const averageSpeed =
        speedValues.reduce((sum, value) => sum + value, 0) / speedValues.length;
      setSpeed(parseFloat(averageSpeed.toFixed(1)));
    }
  }, [speedValues]);

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl mb-4">
        Vitesse (SOG): {speed > 0 ? `${speed} km/h` : 'À l’arrêt'}
      </Text>
    </View>
  );
};

export default Vitesse;
