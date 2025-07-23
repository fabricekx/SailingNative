import React, { useState, useEffect, useContext } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import { CapContext } from "@/app/capContext";
import { getDistance } from "geolib";

interface CourseProps {
  unit: string;
}

const Course: React.FC<CourseProps> = ({ unit }) => {
  const { course, setCourse, currentSpeed, setCurrentSpeed } = useContext(CapContext);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [tracking, setTracking] = useState(false);
  const [trackingDuration, setTrackingDuration] = useState(0);
  const [speedValues, setSpeedValues] = useState<number[]>([]);
  const [trackingPoints, setTrackingPoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // Gestion du tracking start/stop
  const toggleTracking = () => {
    setTracking((prev) => !prev);
    if (!tracking) {
      setTrackingDuration(0);
      setSpeedValues([]);
      setDistance(0);
      setTrackingPoints([]);
      setMaxSpeed(0);
      setCurrentSpeed(0);
      setCourse(null);
    }
  };

  // Reset complet
  const resetData = () => {
    setCurrentSpeed(0);
    setMaxSpeed(0);
    setDistance(0);
    setTrackingDuration(0);
    setSpeedValues([]);
    setTrackingPoints([]);
    setCourse(null);
  };

  // Mise à jour rapide cap et vitesse toutes les secondes (watchPositionAsync)
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission GPS refusée");
        return;
      }

      // Mise à jour rapide cap + vitesse
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // 1 seconde
          distanceInterval: 0,
        },
        (location) => {
          if (!isMounted) return;
          const { speed, heading, accuracy } = location.coords;

          if (accuracy && accuracy <= 10) {
            setAccuracy(accuracy);
            setCurrentSpeed(speed !== null ? speed * 3.6 : 0); // km/h
            setCourse(heading !== null ? heading : null);

            if (speed !== null && speed * 3.6 > maxSpeed) {
              setMaxSpeed(speed * 3.6);
            }

            if (speed !== null && speed * 3.6 > 1) {
              setSpeedValues((prev) => {
                const updated = [...prev, speed * 3.6];
                if (updated.length > 10) updated.shift();
                return updated;
              });
            }
          }
        }
      );

      // Mise à jour lente position pour calcul distance toutes les 60 secondes
      intervalId = setInterval(async () => {
        if (!isMounted) return;

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude, accuracy } = location.coords;

        if (accuracy && accuracy <= 10) {
          setAccuracy(accuracy);

          const newPoint = { latitude, longitude };
          setTrackingPoints((prevPoints) => {
            if (prevPoints.length === 0) {
              return [newPoint]; // premier point
            } else {
              const lastPoint = prevPoints[prevPoints.length - 1];
              const dist = getDistance(lastPoint, newPoint) / 1000; // km
              if (dist > 0.01) {
                setDistance((prev) => prev + dist);
                return [...prevPoints, newPoint];
              }
              return prevPoints;
            }
          });
        }
      }, 60000); // toutes les 60s
    };

    if (tracking) {
      startTracking();
    } else {
      // Stop tracking : cleanup
      if (subscription) subscription.remove();
      if (intervalId) clearInterval(intervalId);
      setAccuracy(null);
      setCurrentSpeed(0);
      setCourse(null);
    }

    return () => {
      isMounted = false;
      if (subscription) subscription.remove();
      if (intervalId) clearInterval(intervalId);
    };
  }, [tracking]);

  // Timer durée tracking
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

  const birdDistance =
    trackingPoints.length >= 2
      ? getDistance(trackingPoints[0], trackingPoints[trackingPoints.length - 1]) / 1000
      : 0;

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

      {/* Cap */}
      <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
        <Text className="text-xl text-blue-800 dark:text-blue-400">Cap suivi (COG) :</Text>
        <Text className="text-5xl text-black dark:text-slate-400">
          {currentSpeed >= 2 && course !== null ? `${course.toFixed(0)}°` : "..."}
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
              ? `${(((distance * 3600) / trackingDuration) / 1.852).toFixed(1)} `
              : `${((distance * 3600) / trackingDuration).toFixed(1)} `
            : "..."}
        </Text>
      </View>

      {/* Distance réelle */}
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

      {/* Distance à vol d'oiseau */}
      <View className="w-[45%] items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
        <Text className="text-xl text-blue-800 dark:text-blue-400">À vol d’oiseau :</Text>
        <Text className="text-3xl text-black dark:text-slate-400">
          {tracking
            ? unit === "Noeuds"
              ? `${(birdDistance / 1.852).toFixed(2)} M`
              : `${birdDistance.toFixed(1)} Km`
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
          onPress={toggleTracking}
          className="px-4 py-2 bg-green-500 rounded-lg mr-2"
        >
          <Text className="text-white text-lg">{tracking ? "Stop" : "Start"}</Text>
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
      </View>

      <Text className="text-white">Précision : {accuracy !== null ? accuracy.toFixed(1) : "N/A"}</Text>
    </View>
  );
};

export default Course;
