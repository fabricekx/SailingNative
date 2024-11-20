// ClickableMap.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker} from 'react-native-maps';
import * as Location from 'expo-location';


type ClickableMapProps = {
  onLocationSelect: (latitude: number, longitude: number) => void;
};

const ClickableMap: React.FC<ClickableMapProps> = ({ onLocationSelect }) => {
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        
      });
      setMarker(currentLocation);
    })();
  }, []);

  const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    onLocationSelect(latitude, longitude);
  };
  // console.log(currentLocation);
  return (
    <View className='flex-1'>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation ? currentLocation.latitude : 43.537, // Exemple: Paris
          longitude: currentLocation ? currentLocation.longitude : 7.0355,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
        onPress={handleMapPress}
        showsUserLocation={!!currentLocation}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>
      {marker && (
        <View style={styles.coordinates}>
          <Text style={styles.text}>
            Latitude: {marker.latitude.toFixed(4)}
          </Text>
          <Text style={styles.text}>
            Longitude: {marker.longitude.toFixed(4)}
          </Text>
        </View>
      )}
      {errorMsg && (
        <View className="absolute top-5 left-5 bg-red-500 p-2 rounded-lg">
          <Text className="text-white">{errorMsg}</Text>
        </View>
      )}
    </View>
  );

 
};

export default ClickableMap;

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    coordinates: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 10,
      borderRadius: 8,
    },
    text: {
      color: '#fff',
      fontSize: 14,
    },
  });