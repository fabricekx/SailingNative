import { Buffer } from "buffer";
import { deviceName } from "expo-device";
import { useState } from "react";
import { Device } from "react-native-ble-plx";


function relais()  {
  const [relais1State, setRelais1State] = useState (false) // false pour ouvert, true pour fermé
  const [relais2State, setRelais2State] = useState (false)

const relais1Close = async (device: Device) => {
  const serviceUUID = "0000ffe0-0000-1000-8000-00805f9b34fb"; // Service UUID
  const characteristicUUID = "0000ffe1-0000-1000-8000-00805f9b34fb"; // Characteristic UUID
  const commandeHex = "A00101A2"; // Commande pour fermer le relais 1 en hexadécimal

  try {
    // Convertir la commande hexadécimale en Base64
    const base64Command = Buffer.from(commandeHex, "hex").toString("base64");

    // Envoyer la commande au périphérique
    await device.writeCharacteristicWithoutResponseForService(
      serviceUUID,
      characteristicUUID,
      base64Command
    );
setRelais1State(true);
    console.log("Commande envoyée pour fermer le relais 1 :", commandeHex, "(Base64 :", base64Command, "): relais fermé");
  } catch (error) {
    console.error("Erreur lors de l'envoi de la commande pour fermer le relais 1 :", error);
  }
};

const relais1Open = async (device: Device) => {
  const serviceUUID = "0000ffe0-0000-1000-8000-00805f9b34fb"; // Service UUID
  const characteristicUUID = "0000ffe1-0000-1000-8000-00805f9b34fb"; // Characteristic UUID
  const commandeHex = "A00100A1"; // Commande pour fermer le relais 1 en hexadécimal

  try {
    // Convertir la commande hexadécimale en Base64
    const base64Command = Buffer.from(commandeHex, "hex").toString("base64");

    // Envoyer la commande au périphérique
    await device.writeCharacteristicWithoutResponseForService(
      serviceUUID,
      characteristicUUID,
      base64Command
    );
setRelais1State(false);
    console.log("Commande envoyée pour ouvrir le relais 1 :", commandeHex, "(Base64 :", base64Command, "): relais ouvert");
  } catch (error) {
    console.error("Erreur lors de l'envoi de la commande pour ouvrir le relais 1 :", error);
  }
};

const relais2Close = async (device: Device) => {
  const serviceUUID = "0000ffe0-0000-1000-8000-00805f9b34fb"; // Service UUID
  const characteristicUUID = "0000ffe2-0000-1000-8000-00805f9b34fb"; // Characteristic UUID
  const commandeHex = "A00201A3"; // Commande pour fermer le relais 1 en hexadécimal

  try {
    // Convertir la commande hexadécimale en Base64
    const base64Command = Buffer.from(commandeHex, "hex").toString("base64");

    // Envoyer la commande au périphérique
    await device.writeCharacteristicWithoutResponseForService(
      serviceUUID,
      characteristicUUID,
      base64Command
    );
setRelais2State(true)
    console.log("Commande envoyée pour fermer le relais 2 :", commandeHex, "(Base64 :", base64Command, "): relais fermé");
  } catch (error) {
    console.error("Erreur lors de l'envoi de la commande pour fermer le relais 2 :", error);
  }
};

const relais2Open = async (device: Device) => {
  const serviceUUID = "0000ffe0-0000-1000-8000-00805f9b34fb"; // Service UUID
  const characteristicUUID = "0000ffe2-0000-1000-8000-00805f9b34fb"; // Characteristic UUID
  const commandeHex = "A00200A2"; // Commande pour fermer le relais 1 en hexadécimal

  try {
    // Convertir la commande hexadécimale en Base64
    const base64Command = Buffer.from(commandeHex, "hex").toString("base64");

    // Envoyer la commande au périphérique
    await device.writeCharacteristicWithoutResponseForService(
      serviceUUID,
      characteristicUUID,
      base64Command
    );
setRelais2State(false);
    console.log("Commande envoyée pour ouvrir le relais 2 :", commandeHex, "(Base64 :", base64Command, "): relais ouvert");
  } catch (error) {
    console.error("Erreur lors de l'envoi de la commande pour ouvrir le relais 2 :", error);
  }
};
return {relais1Close, relais1Open, relais2Close, relais2Open, relais1State, relais2State};

};

export default relais