import { Device } from "react-native-ble-plx";

class ActuatorController {
  private relais1CloseTimestamp: number | null = null;
  private relais2CloseTimestamp: number | null = null;

  private relais1ActiveTime: number | null = null;

  /**
   * Gère automatiquement les relais en fonction du heading et du cap demandé
   */
  async pilotActuator(
    capAsked: number,
    heading: number,
    tolerance: number,
    relais1Close: (device: Device) => Promise<void>,
    relais1Open: (device: Device) => Promise<void>,
    relais2Close: (device: Device) => Promise<void>,
    relais2Open: (device: Device) => Promise<void>,
    device: Device
  ) {
    const angleDifference = this.calculateAngleDifference(capAsked, heading);

    if (angleDifference > tolerance) {
      // Différence positive : Activer relais 1 pour corriger le cap
      if (!this.relais1CloseTimestamp) {
        console.log("Fermeture du relais 1 pour corriger vers la droite.");
        await relais1Close(device);
        this.relais1CloseTimestamp = Date.now();
        this.relais1ActiveTime = null; // Reset du temps d'activation
      }
    } else if (angleDifference < -tolerance) {
      // Différence négative : Activer relais 2 pour corriger le cap
      if (!this.relais2CloseTimestamp) {
        console.log("Fermeture du relais 2 pour corriger vers la gauche.");
        await relais2Close(device);
        this.relais2CloseTimestamp = Date.now();
      }
    } else {
      // Dans la tolérance : Réouvrir les relais et corriger pour ramener au centre
      if (this.relais1CloseTimestamp) {
        console.log("Ouverture du relais 1 (dans la tolérance).");
        await relais1Open(device);

        // Calculer le temps d'activation du relais 1
        const now = Date.now();
        this.relais1ActiveTime = now - this.relais1CloseTimestamp;
        this.relais1CloseTimestamp = null;

        // Activer relais 2 pour ramener au centre
        if (this.relais1ActiveTime) {
          console.log(
            `Fermeture temporaire du relais 2 pour ramener au centre (durée : ${this.relais1ActiveTime}ms).`
          );
          await relais2Close(device);

          setTimeout(async () => {
            console.log("Ouverture du relais 2 (ramené au centre).");
            await relais2Open(device);
            this.relais2CloseTimestamp = null;
          }, this.relais1ActiveTime);
        }
      }

      if (this.relais2CloseTimestamp) {
        console.log("Ouverture du relais 2 (dans la tolérance).");
        await relais2Open(device);
        this.relais2CloseTimestamp = null;
      }
    }
  }

  /**
   * Calcul de la différence d'angle pour rester dans une plage de -180° à 180°
   */
  private calculateAngleDifference(capAsked: number, heading: number): number {
    let difference = capAsked - heading;

    if (difference > 180) {
      difference -= 360;
    } else if (difference < -180) {
      difference += 360;
    }

    return difference;
  }
}

export default ActuatorController;
