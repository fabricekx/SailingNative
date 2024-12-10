import React, { useState, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Indicator from 'ts/sensorFusion'; // utilise la bibliothèque sensorFusion pour simplifier et avoir plus de précision


interface CompasProps {
  onHeadingChange: (heading: number | null) => void; // props qui sera transmise au parent (voir mainPilot)
}       // C'est forcement une fonction

const Compas: React.FC<CompasProps> = ({ onHeadingChange }) => {
  const [heading, setHeading] = useState<number | null>(null); // Cap moyen calculé
  const valuesRef = useRef<number[]>([]); // Stockage des dernières valeurs. Le HookRef permet de stocker des variables sans rendre le composant à chaque modif

  const { heading: currentHeading } = Indicator(); // Récupérer le heading fusionné de Indicator
// NB: la syntaxe si dessus est de la Déstructuration d'objet: ça signifie simplement que le heading provenant de Indicator est renommée currentHeading, pour la différencier de notre variable heading déjà existante
  useEffect(() => {
    // Fonction de mise à jour des valeurs
    const interval = setInterval(() => {
      if (currentHeading !== null) {
        // Ajouter la nouvelle valeur en gardant uniquement les 5 dernières
        if (valuesRef.current.length >= 5) {
          valuesRef.current.shift(); // Supprimer la plus ancienne
        }
        valuesRef.current.push(currentHeading); // Ajouter la nouvelle valeur

        // Calculer la moyenne des 5 dernières valeurs
        const average =
          valuesRef.current.reduce((a, b) => a + b, 0) / valuesRef.current.length;
        setHeading(parseFloat(average.toFixed(1))); // Mettre à jour le cap moyen
      }
    }, 1000); // Met à jour toutes les secondes

    // Nettoyage : supprimer l'intervalle
    return () => clearInterval(interval);
  }, [currentHeading]); // Relancer si currentHeading change


  useEffect(() => { // syntaxe useEffect() => fonction, depandences?
    if (heading !== null) {
      onHeadingChange(heading); // Transmettre le heading au parent
    }
  }, [heading]);


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
