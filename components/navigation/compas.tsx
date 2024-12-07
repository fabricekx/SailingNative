import React, { useState, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { Magnetometer } from 'expo-sensors';

const Compas: React.FC = () => {
  const [heading, setHeading] = useState<number | null>(null);
  const valuesRef = useRef<number[]>([]); // Utilisation de useRef pour stocker les valeurs

  useEffect(() => {
    // Ajouter un listener pour le capteur
    const subscription = Magnetometer.addListener((data) => {
      const { x, y } = data;
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      const headingValue = angle >= 0 ? angle : angle + 360;

      // Ajouter la nouvelle valeur en gardant uniquement les 5 dernières
      if (valuesRef.current.length >= 5) {
        valuesRef.current.shift(); // Supprimer la valeur la plus ancienne
      }
      valuesRef.current.push(headingValue); // Ajouter la nouvelle valeur
    });

    // Calculer la moyenne toutes les secondes
    const interval = setInterval(() => {
      if (valuesRef.current.length > 0) {
        const average =
          valuesRef.current.reduce((a, b) => a + b, 0) / valuesRef.current.length;
        setHeading(parseFloat(average.toFixed(1))); // Mettre à jour le cap
      }
    }, 1000);

    // Nettoyer l'effet (désactiver le listener et le timer)
    return () => {
      subscription.remove(); // Supprimer l'abonnement au capteur
      clearInterval(interval); // Supprimer l'intervalle
    };
  }, []);


  return (
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
