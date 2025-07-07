import { Device } from "react-native-ble-plx";
import { appConfig } from "ts/appConfig";
import RelaisClass from "./relaisClass";

export default class ActuatorController extends RelaisClass {
  constructor() {
    super();

    console.log("ActuatorController instantiated");
  }

  private tribordCloseTimestamp: number | null = null;
  private babordCloseTimestamp: number | null = null;
  private tribordActiveTime: number = 0;
  private babordActiveTime: number = 0;

  private lastDeviations: number[] = [0, 0]; // tuple de stockage des déviations
  private isActuatorRunning: boolean = false;
  private isTurningBabord: boolean = false;
  private isTurningTribord: boolean = false;
  private isTurning: boolean = false; // sert uniquement de flag, pour éviter de remettre la bare au centre si l'action est déjà en cours

  private isBarreCentered: boolean = false;
  private tribordActiveTimeMax: number = appConfig.tribordActiveTimeMax;
  private babordActiveTimeMax: number = appConfig.babordActiveTimeMax;
  private sens: boolean = appConfig.sens;

  // Méthode pour mettre à jour le sens si nécessaire
  public updateSens(newSens: boolean): void {
    this.sens = newSens;
    console.log("Sens mis à jour :", this.sens);
  }
  // Methode pour mettre à jour les temps de fermeture max
  public setTimeMaxBabord(newTime: number): void {
    this.babordActiveTimeMax = newTime;
    console.log("Temps babord mise à jour :", this.babordActiveTimeMax);
  }

  public setTimeMaxTribord(newTime: number): void {
    this.tribordActiveTimeMax = newTime;
    console.log("Temps Tribord mise à jour :", this.tribordActiveTimeMax);
  }

  // permet de modifier le centrage si la dérive est toujours du même côté
  private countnumberdeviation: number = 0;

  // Fonction pour ajuster et controler les temps d'activation du verrin
  private checkActiveTime() {
    if (this.tribordActiveTime > this.tribordActiveTimeMax) {
      this.tribordActiveTime = this.tribordActiveTimeMax;
      console.log("le temps d'activation tribord a été setté au maximum");
    }
    if (this.babordActiveTime > this.babordActiveTimeMax) {
      this.babordActiveTime = this.babordActiveTimeMax;
      console.log("le temps d'activation babord a été setté au maximum");
    }
    if (this.countnumberdeviation > 2) {
      // si ça fait 3 fois que le bateau dérive à babord
      // on va modifier le centre en diminuant le temps du tribordActiveTime
      this.tribordActiveTime -= this.tribordActiveTimeMax / 10;
      console.log(" le temps de remise au centre a été modifié");
      // il faut aussi modifier le temps d'ouverture maximum à tribord et l'augmenter d'autant à babord
      const adjustTime = this.tribordActiveTimeMax / 10;
      this.tribordActiveTimeMax -= adjustTime;
      this.babordActiveTimeMax += adjustTime;
    }
    if (this.countnumberdeviation < -2) {
      // si ça fait 3 fois que le bateau dérive à tribord
      // on va modifier le centre en diminuant le temps du tribordActiveTime
      this.babordActiveTime -= this.babordActiveTimeMax / 10;
      console.log(" le temps de remise au centre a été modifié");
      const adjustTime = this.babordActiveTimeMax / 10;

      this.babordActiveTimeMax -= adjustTime;
      this.tribordActiveTimeMax += adjustTime;
    }
  }

  // Fonctions pour remettre à zéro ou à null les valeurs (quand le cap est bon et quand on stop le pilot)
  public clearActiveTime = () => {
    if (this.babordActiveTime != 0) {
      this.babordActiveTime = 0;
    }
    if (this.tribordActiveTime != 0) {
      this.tribordActiveTime = 0;
    }
    console.log(" les temps d'action ont été remis à 0");
  };

  public clearTimeStamps = () => {
    if (this.tribordCloseTimestamp) {
      this.tribordCloseTimestamp = null;
    }
    if (this.babordCloseTimestamp) {
      this.babordCloseTimestamp = null;
    }
    console.log("le TimeStamp a été mis à null");
  };

  public clearIsTurning = () => {
    if (this.isTurningBabord) {
      this.isTurningBabord = false;
    }
    if (this.isTurningTribord) {
      this.isTurningTribord = false;
    }
    console.log("isTurning a été mis à false");
  };
  // Fonction pour tourner en fonction du sens venu de config
  async turnToDirection(direction: "babord" | "tribord", device: Device) {
    if (!device) {
      console.error("Le périphérique (device) est invalide ou non défini.");
      return;
    }

    try {
      this.isActuatorRunning = true;
      if (
        (direction === "tribord" && this.sens) || // Utilisation de this.sens
        (direction === "babord" && !this.sens)
      ) {
        console.log(`Activation du relais 1 pour tourner vers ${direction}.`);
        await this.closeRelais1(device);
      } else {
        console.log(`Activation du relais 2 pour tourner vers ${direction}.`);
        await this.closeRelais2(device);
      }
    } catch (error) {
      console.error(
        `Erreur lors de l'activation du relais pour ${direction}:`,
        error
      );
    }
  }

  async stopTurn(device: Device): Promise<void> {
    try {
      await this.openRelais1(device);
      await this.openRelais2(device);
      this.isActuatorRunning = false;
      // si le pilot est actif, on calcul les temps d'activité des verrins
      if (this.babordCloseTimestamp != null) {
        this.babordActiveTime += Date.now() - this.babordCloseTimestamp; // On ajoute le temps de fermeture
        this.babordCloseTimestamp = null; // on réinitialise le debut de fermeture
        console.log(
          "Le temps d'activité babord a été mis à jours dans StopTurn",
          this.babordActiveTime
        );
      }
      if (this.tribordCloseTimestamp != null) {
        this.tribordActiveTime += Date.now() - this.tribordCloseTimestamp; // On ajoute le temps de fermeture
        this.tribordCloseTimestamp = null; // on réinitialise le debut de fermeture
        console.log(
          "Le temps d'activité tribord a été mis à jours dans StopTurn",
          this.tribordActiveTime
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'arrêt des relais :", error);
    }
  }

  /**
   * Calcul de la différence d'angle pour rester dans une plage de -180° à 180°
   */
  private calculateDeviation(capAsked: number, heading: number): number {
    let difference = capAsked - heading;

    if (difference > 180) {
      difference -= 360;
    } else if (difference < -180) {
      difference += 360;
    }

    return difference;
  }

  private updateLastDeviation(newDrift: number) {
    // Ajouter la nouvelle valeur
    this.lastDeviations.push(newDrift);

    // Garder uniquement les deux dernières valeurs
    if (this.lastDeviations.length > 2) {
      this.lastDeviations.shift(); // Supprime la valeur la plus ancienne
    }
  }

  private isDeviationBetter(): boolean {
    if (this.lastDeviations.length < 2) return false;
    const [firstValue, secondValue] = this.lastDeviations;
    return Math.abs(firstValue) > Math.abs(secondValue);
  }

  /* Logique:
    Cas 1: Le cap ne s'améliore pas et le verrin est inactif: on vire et on enregistre le moment
    Cas 2: Le verrin est actif et le cap s'améliore: on arrete le verrin et on compte le temps de fermeture
    Cas 3: Le verrin est actif et le cap ne s'améliore pas: on ne fait rien. 
    Cas 4: Le verrin est inactif et le cap s'améliore: on ne fait rien
    ATTENTION: si babordActiveTime est supérieur à timeMaxBabord: il faudra le préciser dans la fonction pour cap correct
    Il faudra également remettre à null le activeTime, et le isCentered et le isTurningBabord
    Le isActuator running est gérer par turnToBabord et par stopTurn
    */
  private async handleDriftToTribord(deviation: number, device: Device) {
    // si dérive à tribord, on vire à babord
    this.updateLastDeviation(deviation);
    console.log("Deviation: ", deviation);
    // CAS 1 : le verrin est inactif et le cap ne s'améliore pas, on active le verrin pour tourner vers babord
    if (!this.isActuatorRunning && !this.isDeviationBetter()) {
      await this.turnToDirection("babord", device);
      this.babordCloseTimestamp = Date.now(); // on enregistre le temps de début de fermeture
      this.isTurningBabord = true;
      this.isBarreCentered = false;
      console.log("Cas 1 dérive Tribord, timeStamp enregistré");
    }
    // CAS 2 : le verrin est déjà actif
    if (this.isActuatorRunning && this.isDeviationBetter()) {
      await this.stopTurn(device); // on arrete le verrin, le temps de fonctionnement du verrin est calculé dans la fonction stopTurn
      console.log("Cas 2 dérive tribord, stopTurn");
    }
  }

  private async handleDriftToBabord(deviation: number, device: Device) {
    // si dérive à Babord, on vire à tribord
    this.updateLastDeviation(deviation);
    console.log("Deviation: ", deviation);
    // CAS 1 : le verrin est inactif et le cap ne s'améliore pas, on active le verrin pour tourner vers tribord
    if (!this.isActuatorRunning && !this.isDeviationBetter()) {
      await this.turnToDirection("tribord", device);
      this.tribordCloseTimestamp = Date.now(); // on enregistre le temps de début de fermeture
      this.isTurningTribord = true;
      this.isBarreCentered = false;
      console.log("Cas1 dérive babord, TimeStamp enregistré");
    }
    // CAS 2 : le verrin est déjà actif
    if (this.isActuatorRunning && this.isDeviationBetter()) {
      await this.stopTurn(device); // on arrete le verrin
      console.log(" cas 2 babord, stopTurn");
    }
  }

  // Permet de tourner pendant un temps donner de manière séquentielle
  private async handleTurn(
    direction: "babord" | "tribord",
    device: Device,
    activeTime: number
  ) {
    if (this.isTurning) {
      // Si une rotation est déjà en cours, on ignore l'appel
      // La méthode pilotActuator est appellée grace à un useEffect dans WhenRunning
      // Elle est appelée à chaque modification du heading (paramétrable)
      // Si elle est appelée alors que l'appel précédent n'a pas fini le handle turn, risque de problème
      return;
    }
    this.isTurning = true;
    try {
      await this.turnToDirection(direction, device);
      await new Promise((resolve) => setTimeout(resolve, activeTime));
      await this.stopTurn(device);
      this.isBarreCentered = true;
      this.clearActiveTime();
      this.clearTimeStamps();
      this.clearIsTurning();
      this.countnumberdeviation += direction === "babord" ? -1 : 1;
      this.lastDeviations = [0, 0];
    } finally {
      this.isTurning = false;
    }
  }

  private async handleCapOK(device: Device) {
    // il pourrait arriver que le cap soit bon alors que le verrin est en marche
    // il faut alors le stopper et calculer le temps qu'il est resté actif
    console.log("Le cap est bon");
    {
      if (this.isActuatorRunning) {
        console.log("cas particulier cap bon");

        await this.stopTurn(device); // ce qui calcule en meme temps les activeTime
      }

      // on vérifie que les temps de fermeture ne sont pas supérieurs aux temps max
      // et que la dérive n'est pas toujours du même côté
      this.checkActiveTime();

      if (this.isTurningTribord) {
        await this.handleTurn("babord", device, this.tribordActiveTime);
      }
      if (this.isTurningBabord) {
        await this.handleTurn("tribord", device, this.babordActiveTime);
      }
    }
  }

  /**
   * Gère automatiquement les relais en fonction du heading et du cap demandé
   */
  async pilotActuator(
    capAsked: number,
    heading: number,
    tolerance: number,

    device: Device
  ) {
    const deviation = Math.round(this.calculateDeviation(capAsked, heading)); // number, différence en degrés,comprose entre -180 (déviation à tribord)
    //  et +180 (déviation à babord)

  //  J'enferme tout dans une condition: si la barre est entrain de revenir au centre, on ne fait rien
    if (!this.isTurning) {
       /* 
    Si déviation vers BABORD
    */
      //  activation du verrin, si Deviation est positif et suppérieur à tolérence, j'ai dérivé vers babord
      if (deviation > tolerance) {
        await this.handleDriftToBabord(deviation, device);
      }

      /* 
    Si déviation vers Tribord
    */
      if (deviation < -tolerance) {
        // Différence négative : dérive à tribord. J'appelle le fonction
        await this.handleDriftToTribord(deviation, device);
      }

      /* 
    Si le cap est bon et que la barre n'est pas centrée
    */
      if (Math.abs(deviation) < tolerance && !this.isBarreCentered) {
        // si le cap est bon
        await this.handleCapOK(device);
      }
    }
  }
}
