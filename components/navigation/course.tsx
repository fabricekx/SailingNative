import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import * as Location from "expo-location";

interface CapEtVitesseProps {
  unit: string;
}

const CapEtVitesse: React.FC<CapEtVitesseProps> = ({ unit }) => {
  const [currentSpeed, setCurrentSpeed] = useState(0); // Vitesse actuelle en km/h
  const [course, setCourse] = useState<number | null>(null); // Cap actuel en degrés
  const [maxSpeed, setMaxSpeed] = useState(0); // Vitesse maximale
  const [distance, setDistance] = useState(0); // Distance parcourue en km
  const [tracking, setTracking] = useState(false); // Indique si le tracking est actif
  const [trackingDuration, setTrackingDuration] = useState(0); // Durée totale du tracking en secondes
  const [speedValues, setSpeedValues] = useState<number[]>([]); // Historique des vitesses pour la moyenne
  const [prevLocation, setPrevLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // Fonction pour démarrer ou arrêter le tracking
  const toggleTracking = () => {
    setTracking((prev) => !prev);
    if (!tracking) {
      setTrackingDuration(0); // Réinitialiser la durée si on redémarre le tracking
      setSpeedValues([]); // Réinitialiser les vitesses pour la moyenne
    }
  };

  // Fonction pour réinitialiser les données
  const resetData = () => {
    setCurrentSpeed(0);
    setMaxSpeed(0);
    setDistance(0);
    setTrackingDuration(0);
    setPrevLocation(null);
    setSpeedValues([]);
  };

  // Fonction utilitaire : Calcul de la distance entre deux coordonnées GPS (formule de Haversine)
  const haversine = (
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
  ) => {
    const R = 6371; // Rayon de la Terre en km
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);

    const lat1 = toRad(coord1.latitude);
    const lat2 = toRad(coord2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en km
  };

  // Gestion de la localisation
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission denied for location access.");
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000, // Mise à jour toutes les 3 secondes
          distanceInterval: 10, // Mise à jour après 10 mètres
        },
        (location) => {
          const { speed, heading, latitude, longitude, accuracy } =
            location.coords;

          if (accuracy > 20 || !accuracy) return; // si la précision du GPS est mauvaise, on sort
          // Mise à jour de la précision
          setAccuracy(accuracy);
          // Toujours mettre à jour la vitesse actuelle et le cap
          setCurrentSpeed(speed !== null ? speed * 3.6 : 0); // Conversion en km/h
          setCourse(heading !== null ? heading : null);

          // Si on est en mode tracking, on enregistre le reste (distance, vitesse Max)
          if (tracking) {
            // Calcul de la distance parcourue
            if (prevLocation) {
              const distanceIncrement = haversine(
                {
                  latitude: prevLocation.latitude,
                  longitude: prevLocation.longitude,
                },
                { latitude, longitude }
              );

              if (distanceIncrement > 0.01) {
                setDistance((prevDistance) => prevDistance + distanceIncrement);
              }
            }
            setPrevLocation({ latitude, longitude });

            // Mise à jour de la vitesse maximale
            if (speed !== null && speed * 3.6 > maxSpeed) {
              setMaxSpeed(speed * 3.6);
            }

            // Mise à jour des vitesses pour la moyenne
            if (speed !== null && speed * 3.6 > 1) {
              setSpeedValues((prev) => {
                const updatedSpeeds = [...prev, speed * 3.6];
                if (updatedSpeeds.length > 10) updatedSpeeds.shift(); // Garder les 10 dernières valeurs
                return updatedSpeeds;
              });
            }
          }
        }
      );
    };

    startTracking();

    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, [tracking, prevLocation]);

  // Timer pour la durée de tracking
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (tracking) {
      timer = setInterval(() => {
        setTrackingDuration((prev) => prev + 1);
      }, 1000);
    } else if (!tracking && timer) {
      clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [tracking]);

  // Formatage de la durée
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;

    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };
  return (
    <View className="flex-row flex-wrap justify-between">
      {/* Vitesse actuelle */}
      <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
        <Text className="text-xl text-blue-800 dark:text-blue-400">Vitesse (SOG) :</Text>
        <Text className="text-5xl text-black dark:text-slate-400">
          {currentSpeed > 0
            ? unit === "Noeuds"
              ? `${(currentSpeed / 1.852).toFixed(1)} `
              : `${currentSpeed.toFixed(1)} `
            : "À l’arrêt"}
        </Text>
      </View>

      {/* Cap actuel */}
      <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
        <Text className="text-xl text-blue-800 dark:text-blue-400">Cap suivi (COG) :</Text>
        <Text className="text-5xl text-black dark:text-slate-400">
          {currentSpeed >= 3 && course !== null
            ? `${course.toFixed(0)}°`
            : "..."}
        </Text>
      </View>

      {/* Vitesse max */}
      <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
        <Text className="text-xl text-blue-800 dark:text-blue-400">Vitesse Max :</Text>
        <Text className="text-5xl text-black dark:text-slate-400">
          {tracking
            ? unit === "Noeuds"
              ? `${(maxSpeed / 1.852).toFixed(1)} `
              : `${maxSpeed.toFixed(1)} `
            : "..."}
        </Text>
      </View>

      {/* Vitesse moyenne */}
      <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
        <Text className="text-xl text-blue-800 dark:text-blue-400">Vitesse Moy. :</Text>
        <Text className="text-5xl text-black dark:text-slate-400">
          {tracking
            ? unit === "Noeuds"
              ? `${(((distance * 3600) / trackingDuration) * 1.852).toFixed(
                  1
                )} `
              : `${((distance * 3600) / trackingDuration).toFixed(1)} `
            : "..."}
        </Text>
      </View>

      {/* Distance parcourue */}
      <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
        <Text className="text-xl text-blue-800 dark:text-blue-400">Lock :</Text>
        <Text className="text-5xl text-black dark:text-slate-400">
          {tracking
            ? unit === "Noeuds"
              ? `${(distance / 1.852).toFixed(2)} M`
              : `${distance.toFixed(1)} Km`
            : "..."}
        </Text>
      </View>

      {/* Durée */}
      <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
        <Text className="text-xl text-blue-800 dark:text-blue-400">Durée :</Text>
        <Text className="text-3xl text-black dark:text-slate-400">
          {formatDuration(trackingDuration)}
        </Text>
      </View>

      {/* Boutons */}
      <View className="flex-row justify-between w-full">
        <TouchableOpacity
          onPress={() => setTracking((prev) => !prev)}
          className="px-4 py-2 bg-green-500 rounded-lg mr-2"
        >
          <Text className="text-white text-lg">
            {tracking ? "Stop" : "Start"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setTracking(false);
            resetData();
          }}
          className="px-4 py-2 bg-red-500 rounded-lg"
        >
          <Text className="text-white text-lg">Reset</Text>
        </TouchableOpacity>
        <Text className="text-white">Précision :{accuracy && accuracy.toFixed(1)}</Text>
      </View>
    </View>
  );
};

export default CapEtVitesse;
