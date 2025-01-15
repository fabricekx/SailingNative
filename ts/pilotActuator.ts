import { Device } from "react-native-ble-plx";
import { appConfig } from 'ts/appConfig';

class ActuatorController {
  private tribordCloseTimestamp: number | null = null;
  private babordCloseTimestamp: number | null = null;

  private tribordActiveTime: number = 0;
  private babordActiveTime: number = 0;

  private lastDeviations: [number,number] = [0,0]; // tuple de stockage des déviations
  private isActuatorRunning: boolean = false;
  private isTurningBabord: boolean = false;
  private isTurningTribord: boolean = false;
  private isBarreCentered: boolean = true;
  private openingTimeMaxTribord: number = appConfig.openingTimeMaxTribord;
  private openingTimeMaxBabord: number = appConfig.openingTimeMaxBabord;

  private countnumberdeviation: number =0
  private sens:boolean = appConfig.sens;



   // Méthode pour mettre à jour le sens si nécessaire
 public updateSens(newSens: boolean): void {
  this.sens = newSens;
  console.log("Sens mis à jour :", this.sens);
}

// Fonction pour tourner en fonction du sens venu de config
async turnToDirection(
  direction: "babord" | "tribord",
  device: Device,
  relais1Close: (device: Device) => Promise<void>,
    relais1Open: (device: Device) => Promise<void>,
    relais2Close: (device: Device) => Promise<void>,
    relais2Open: (device: Device) => Promise<void>,
) {
  if (!device) {
    console.error("Le périphérique (device) est invalide ou non défini.");
    return;
  }

  try {
    if (
      (direction === "tribord" && this.sens) || // Utilisation de this.sens
      (direction === "babord" && !this.sens)
    ) {
      console.log(`Activation du relais 1 pour tourner vers ${direction}.`);
      await relais1Close(device);
    } else {
      console.log(`Activation du relais 2 pour tourner vers ${direction}.`);
      await relais2Close(device);
    }
  } catch (error) {
    console.error(`Erreur lors de l'activation du relais pour ${direction}:`, error);
  }
}

async stopTurn(device: Device,
  relais1Close: (device: Device) => Promise<void>,
  relais1Open: (device: Device) => Promise<void>,
  relais2Close: (device: Device) => Promise<void>,
  relais2Open: (device: Device) => Promise<void>,
): Promise<void> {
  try {
    await relais1Open(device);
    await relais2Open(device);
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


private isDeviationBetter() :boolean{

  const [firstValue, secondValue] = this.lastDeviations; // Déstructuration pour obtenir les deux valeurs
  if (Math.abs(firstValue) > Math.abs(secondValue)) {
return true  } // le cap s'améliore
else if 
(Math.abs(firstValue)<= Math.abs(secondValue)) {
return false  } // le cap ne  s'améliore pas
}

private async handleTribord(
  deviation: number,
  device: Device,
  relais1Close: (device: Device) => Promise<void>,
  relais1Open: (device: Device) => Promise<void>,
  relais2Close: (device: Device) => Promise<void>,
  relais2Open: (device: Device) => Promise<void>,
) {
  this.updateLastDeviation(deviation);
  
  if (this.isBarreCentered) {
    console.log("Début d'activation vers Tribord");
    await this.turnToDirection("tribord", device, relais1Close, relais1Open, relais2Close, relais2Open);
    this.tribordCloseTimestamp = Date.now();
    this.isTurningTribord = true;
    this.isBarreCentered = false;
    this.isActuatorRunning = true;
  } else if (this.isTurningTribord) {
    if (this.isDeviationBetter() && this.isActuatorRunning) {
      console.log("CAS 1: le cap s'améliore, arrêt du vérin");
      await this.stopTurn(device, relais1Close, relais1Open, relais2Close, relais2Open);
      this.isActuatorRunning = false;
      if (this.tribordCloseTimestamp != null) {
        this.tribordActiveTime += (Date.now() - this.tribordCloseTimestamp);
      } else {
        console.warn("tribordCloseTimestamp est null ou undefined, impossible d'ajouter le temps.");
      }
      this.tribordCloseTimestamp = null;
    } else if (!this.isDeviationBetter() && !this.isActuatorRunning) {
      console.log("CAS 2: la déviation ré-augmente, réactivation du vérin");
      await this.turnToDirection("tribord", device, relais1Close, relais1Open, relais2Close, relais2Open);
      this.isActuatorRunning = true;
      this.tribordCloseTimestamp = Date.now();
    }
  } else if (this.isTurningBabord) {
    console.log("Problème sérieux : la barre est à bâbord alors que la déviation est à tribord.");
  }
}


private async handleBabord(
  deviation: number,
  device: Device,
  relais1Close: (device: Device) => Promise<void>,
  relais1Open: (device: Device) => Promise<void>,
  relais2Close: (device: Device) => Promise<void>,
  relais2Open: (device: Device) => Promise<void>
) {
  this.updateLastDeviation(deviation); // on enregistre la différence pour le tour suivant
      if (this.isBarreCentered) {
        // si la barre est centrée, on commence à actionner vers babord
        await this.turnToDirection("babord", device,  relais1Close, relais1Open, relais2Close, relais2Open);
        this.babordCloseTimestamp = Date.now();
        this.isTurningBabord = true;
        this.isActuatorRunning = true;
        this.isBarreCentered = false;
      } else if (this.isTurningBabord) {
         if (this.isDeviationBetter()===true && this.isActuatorRunning) { // ici la déviation est négative
          // si le cap s'améliore et que la barre est en mouvement
          await this.stopTurn(device,relais1Close, relais1Open, relais2Close, relais2Open);

          this.isActuatorRunning = false;
          if (this.babordCloseTimestamp != null) {
            this.babordActiveTime += (Date.now() - this.babordCloseTimestamp); // On ajoute le temps de fermeture
          } else {
            console.warn("babordCloseTimestamp est null ou undefined, impossible d'ajouter le temps.");
          }          // this.babordActiveTime>this.openingTimeMaxBabord &&  (this.babordActiveTime=this.openingTimeMaxBabord);
          this.babordCloseTimestamp = null; // on réinitialise le début de fermeture
        } else if (this.isDeviationBetter()===false && !this.isActuatorRunning){
          // si le cap ne s'améliore pas et que le verrin est à l'arret, on le redémarre
          await this.turnToDirection("babord", device,relais1Close, relais1Open, relais2Close, relais2Open)

          this.isActuatorRunning= true;
          this.babordCloseTimestamp= Date.now(); // on enregistre le temps de début de refermeture
        }
        
      }
else if(this.isTurningBabord){ // si la barre est à babord et que la déviation est à babord, on a un serieux problème...
console.log("on a un serieux problème babord")
}
}


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

    device: Device,
  )  {
    const deviation = this.calculateDeviation(capAsked, heading); // number, différence en degrés,comprose entre -180 (déviation à tribord)
    //  et +180 (déviation à babord)

    /* 
    Si déviation vers BABORD
    */

    //  activation du verrin, si Deviation est positif et suppérieur à tolérence, j'ai dérivé vers babord
    if (deviation > tolerance) {
     await this.handleTribord(deviation,device,relais1Close, relais1Open, relais2Close, relais2Open)
    } 
    

 /* 
    Si déviation vers Tribord
    */
    if (deviation < -tolerance) {
      // Différence négative : dérive à tribord. Activer relais 2 pour mettre la barre à babord (barre à roue)
      await this.handleBabord(deviation,device,relais1Close, relais1Open, relais2Close, relais2Open)

    } 



    /* 
    Si le cap est bon
    */
    if (Math.abs(deviation)< tolerance) { // si le cap est bon
      // on vérifie que les temps de fermeture ne sont pas supérieurs aux temps max
      if(this.tribordActiveTime>this.openingTimeMaxTribord){this.tribordActiveTime=this.openingTimeMaxTribord};
      if(this.babordActiveTime>this.openingTimeMaxBabord){this.babordActiveTime=this.openingTimeMaxBabord};
      await this.stopTurn(device,relais1Close, relais1Open, relais2Close, relais2Open); // normalement c'est forcément le cas

      if (this.isTurningTribord) {
      await this.turnToDirection("babord",  device,relais1Close, relais1Open, relais2Close, relais2Open);
      if (this.countnumberdeviation >2){ // si ça fait 3 fois que le bateau dérive à babord
// on va modifier le centre en diminuant le temps du tribordActiveTime
this.tribordActiveTime -= this.openingTimeMaxTribord/10;
console.log(" le temps de remise au centre a été modifié")
// il faut aussi modifier le temps d'ouverture maximum à tribord et l'augmenter d'autant à babord
this.openingTimeMaxTribord-=this.openingTimeMaxTribord/10
this.openingTimeMaxBabord+=this.openingTimeMaxTribord/10
      }
      setTimeout(async () => { // on le rouvre pour le ramener au centre durant le temps défini
        await this.stopTurn(device,relais1Close, relais1Open, relais2Close, relais2Open); 
      }, this.tribordActiveTime);
      this.tribordActiveTime= 0 // on remet à zéro
      this.tribordCloseTimestamp = null;
      this.isBarreCentered = true;
      this.isTurningTribord = false;
      this.isTurningBabord = false // simple sécurité
      this.countnumberdeviation +=1;
      this.lastDeviations=[0,0]
    }
    if (this.isTurningBabord) {
      await this.turnToDirection("tribord", device,relais1Close, relais1Open, relais2Close, relais2Open);
      if (this.countnumberdeviation <-2){ // si ça fait 3 fois que le bateau dérive à tribord
// on va modifier le centre en diminuant le temps du tribordActiveTime
this.babordActiveTime =- this.openingTimeMaxBabord/10;
console.log(" le temps de remise au centre a été modifié")
this.openingTimeMaxBabord-= this.openingTimeMaxBabord/10
this.openingTimeMaxTribord+= this.openingTimeMaxBabord/10
      }
      setTimeout(async () => { // on le rouvre pour le ramener au centre
        await this.stopTurn(device,relais1Close, relais1Open, relais2Close, relais2Open); 
      }, this.babordActiveTime);
      this.babordActiveTime= 0 // 
      this.babordCloseTimestamp = null;
      this.isBarreCentered = true;
      this.isTurningTribord = false;
      this.isTurningBabord = false 
      this.countnumberdeviation -=1;
      this.lastDeviations=[0,0]
    }
    }
    
  }



  

}

export default ActuatorController;
