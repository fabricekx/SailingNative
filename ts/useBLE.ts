/* eslint-disable no-bitwise */
import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";
import relais from "./relais";

// import base64 from "react-native-base64";


interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
}

function useBLE(): BluetoothLowEnergyApi {
  const {relais1Close} = relais();
  const bleManager = useMemo(() => new BleManager(), []); // use memo est un hook permettant d'éviter de refaire la meme chose à chaque rechargement du composant

  const [allDevices, setAllDevices] = useState<Device[]>([]); //<Device[]> est une indication de TypeScript pour préciser que l'état sera un tableau d'objets du type Device

  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const requestAndroid31Permissions = async () => { // méthode pour les ancien appareils
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => { // Permissions classiques
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    {console.log("début du scan")
    bleManager.startDeviceScan(null, null, (error, device) => {
        // console.log(" périphériques du scan: " , device)
      if (error) {
        console.log(error);
      }
      if (device && (device.name?.includes("JDY") || device.name?.includes("BLE") )) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }

          return prevState;
        });
      };
      
    }); }

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      // Pour tests:
      // startUsingDevise(deviceConnection);
      // lectureValeursUUID(deviceConnection);
// relais1Close(deviceConnection);
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    }
  };



  const viewDeviceServices = async (device: Device) => { // Le plus facile est d'utiliser un utilitaire, comme nRF Connect
    if (device) {
      try {
        // Découvrir tous les services et caractéristiques
        await device.discoverAllServicesAndCharacteristics();
        
        // Récupérer les services
        const services = await device.services();
        for (const service of services) {
          console.log(`Service UUID: ${service.uuid}`);
          
          // Récupérer les caractéristiques pour chaque service
          const characteristics = await service.characteristics();
          characteristics.forEach((char) => {
            console.log(`  Characteristic UUID: ${char.uuid}`);
          });
        }
      } catch (error) {
        console.error('Erreur lors de la découverte des services/caractéristiques:', error);
      }
    }
    console.log("No Device Connected");

  };

  const lectureValeursUUID = async (device: Device) => { // ne semble pas fonctionner
    try {
      const characteristic = await device.readCharacteristicForService(
        "0000ffe0-0000-1000-8000-00805f9b34fb", 
        "0000ffe1-0000-1000-8000-00805f9b34fb"
      );
      console.log("Valeur lue:", characteristic.value);
    } catch (error) {
      console.error("Erreur lors de la lecture:", error);
    }
  };



  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
  };
}

export default useBLE;
