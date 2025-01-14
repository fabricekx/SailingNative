import { Buffer } from "buffer";
import { Device } from "react-native-ble-plx";

export default class Relais {
  private relais1State: boolean; // false pour ouvert, true pour fermé
  private relais2State: boolean;

  constructor() {
    this.relais1State = false;
    this.relais2State = false;
    console.log("relais initialisés")
  }

  async closeRelais1(device: Device): Promise<void> {
    const serviceUUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
    const characteristicUUID = "0000ffe1-0000-1000-8000-00805f9b34fb";
    const commandeHex = "A00101A2";

    try {
      const base64Command = Buffer.from(commandeHex, "hex").toString("base64");
      await device.writeCharacteristicWithoutResponseForService(
        serviceUUID,
        characteristicUUID,
        base64Command
      );
      this.relais1State = true;
      console.log(
        "Commande envoyée pour fermer le relais 1 :", commandeHex,
        "(Base64 :", base64Command, "): relais fermé"
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de la commande pour fermer le relais 1 :", error);
    }
  }

  async openRelais1(device: Device): Promise<void> {
    const serviceUUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
    const characteristicUUID = "0000ffe1-0000-1000-8000-00805f9b34fb";
    const commandeHex = "A00100A1";

    try {
      const base64Command = Buffer.from(commandeHex, "hex").toString("base64");
      await device.writeCharacteristicWithoutResponseForService(
        serviceUUID,
        characteristicUUID,
        base64Command
      );
      this.relais1State = false;
      console.log(
        "Commande envoyée pour ouvrir le relais 1 :", commandeHex,
        "(Base64 :", base64Command, "): relais ouvert"
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de la commande pour ouvrir le relais 1 :", error);
    }
  }

  async closeRelais2(device: Device): Promise<void> {
    const serviceUUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
    const characteristicUUID = "0000ffe2-0000-1000-8000-00805f9b34fb";
    const commandeHex = "A00201A3";

    try {
      const base64Command = Buffer.from(commandeHex, "hex").toString("base64");
      await device.writeCharacteristicWithoutResponseForService(
        serviceUUID,
        characteristicUUID,
        base64Command
      );
      this.relais2State = true;
      console.log(
        "Commande envoyée pour fermer le relais 2 :", commandeHex,
        "(Base64 :", base64Command, "): relais fermé"
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de la commande pour fermer le relais 2 :", error);
    }
  }

  async openRelais2(device: Device): Promise<void> {
    const serviceUUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
    const characteristicUUID = "0000ffe2-0000-1000-8000-00805f9b34fb";
    const commandeHex = "A00200A2";

    try {
      const base64Command = Buffer.from(commandeHex, "hex").toString("base64");
      await device.writeCharacteristicWithoutResponseForService(
        serviceUUID,
        characteristicUUID,
        base64Command
      );
      this.relais2State = false;
      console.log(
        "Commande envoyée pour ouvrir le relais 2 :", commandeHex,
        "(Base64 :", base64Command, "): relais ouvert"
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de la commande pour ouvrir le relais 2 :", error);
    }
  }

  // Getter pour les états
  getRelais1State(): boolean {
    return this.relais1State;
  }

  getRelais2State(): boolean {
    return this.relais2State;
  }
}

