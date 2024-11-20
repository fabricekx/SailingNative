import React, { useState, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { Magnetometer } from 'expo-sensors';

const Compas: React.FC = () => {
  const [heading, setHeading] = useState<number | null>(null);
  const valuesRef = useRef<number[]>([]); // Utilisation de useRef pour stocker les valeurs

  useEffect(() => {
    const subscription = Magnetometer.addListener((data) => {
      const { x, y } = data;
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      const headingValue = angle >= 0 ? angle : angle + 360;

      // Ajouter la nouvelle valeur au tableau via useRef
      valuesRef.current.push(headingValue);
    });

    const interval = setInterval(() => {
      if (valuesRef.current.length > 0) {
        const average =
          valuesRef.current.reduce((a, b) => a + b, 0) / valuesRef.current.length;
        setHeading(parseFloat(average.toFixed(1))); // Mettre à jour le cap
        valuesRef.current = []; // Réinitialiser le tableau
      }
    }, 1000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl mb-4">
        Cap suivi : {heading !== null ? `${heading.toFixed(0)}°` : 'Calcul en cours...'}
      </Text>
    </View>
  );
};

export default Compas;
