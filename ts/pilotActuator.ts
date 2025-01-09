import { Device } from "react-native-ble-plx";
import { appConfig } from 'ts/appConfig';

class ActuatorController {
  private relais1CloseTimestamp: number | null = null;
  private relais2CloseTimestamp: number | null = null;

  private relais1ActiveTime: number = 0;
  private relais2ActiveTime: number = 0;

  private lastDeviations: [number,number] = [0,0]; // tuple de stockage des déviations
  private isActuatorRunning: boolean = false;
  private isBarreBabord: boolean = false;
  private isBarreTribord: boolean = false;
  private isBarreCentered: boolean = true;
private openingTimeMaxTribord: number = 0;
private openingTimeMaxBabord: number = 0;

  private countnumberdeviation: number =0

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
  ) {
// Ces valeur proviennent de mon objet config et peuvent etre configurées dans configTiller
    this.openingTimeMaxBabord = appConfig.openingTimeMaxBabord;
    this.openingTimeMaxTribord = appConfig.openingTimeMaxTribord;

    const deviation = this.calculateDeviation(capAsked, heading); // number, différence en degrés,comprose entre -180 (déviation à tribord)
    //  et +180 (déviation à babord)

    /* 
    Si déviation vers BABORD
    */

    //  activation du verrin, si Deviation est positif et suppérieur à tolérence, j'ai dérivé vers babord
    if (deviation > tolerance) {
      // Différence positive : dérive à babord. Activer relais 1 pour mettre la barre à tribord (barre à roue)
      this.updateLastDeviation(deviation); // on enregistre la différence pour le tour suivant
      if (this.isBarreCentered) {
        // si la barre est centrée, on commence à actionner vers Tribord
        console.log("barre au centre, début d'activation du verrin")
        await relais1Close(device);
        this.relais1CloseTimestamp = Date.now();
        this.isBarreTribord = true;
        this.isActuatorRunning = true;
        this.isBarreCentered = false;
      } else if (this.isBarreTribord) { 
        console.log("relais1ActiveTime : ", this.relais1ActiveTime);
        console.log("lastDeviation : ", this.lastDeviations);
        console.log("amélioration du cap : ", this.isDeviationBetter());
        if (this.relais1ActiveTime >= this.openingTimeMaxTribord) { // si barre a tribord toute
          console.log("CAS 1: durée maximale atteinte")
          await relais1Open(device); // on arrete la barre
          this.isActuatorRunning = false;
          this.relais1ActiveTime = this.openingTimeMaxTribord; 
        } else if (this.isDeviationBetter()===true && this.isActuatorRunning) {
          //sinon si le cap s'améliore et que la barre est en mouvement
          console.log("CAS 2: le cap s'améliore, arret du verrin")
          await relais1Open(device); // on l'arrete
          this.isActuatorRunning = false;
          this.relais1ActiveTime +=(Date.now() - this.relais1CloseTimestamp); // on ajoute le temps de fermeture
          this.relais1CloseTimestamp = null; // on réinitialise le début de fermeture
        } else if (this.isDeviationBetter()===false && !this.isActuatorRunning){
          // si le cap ne s'améliore pas et que le verrin est à l'arret.
          console.log("CAS 3: la dérive ré-augmente, on ré-active le verrin")
          await relais1Close(device); // on rallume le verrin
          this.isActuatorRunning= true;
          this.relais1CloseTimestamp= Date.now(); // on enregistre le temps de début de refermeture
        }
        else if (this.isDeviationBetter()=== false && this.isActuatorRunning) { // si le verrin est en mouvement et que le cap ne s'améliore pas
        // on ne fait rien, on compte simplement le temps d'activation
        console.log("CAS 4 : la dérive continue, on laisse le verrin actif")
        this.relais1ActiveTime= Date.now()- this.relais1CloseTimestamp
        console.log(" durée ouverture fermeture relais1 : ", this.relais1ActiveTime)
        }
      }
else if(this.isBarreBabord){ // si la barre est à babord et que la déviation est à babord, on a un serieux problème...
console.log("on a un serieux problème tribord")
}
    } 
    

 /* 
    Si déviation vers Tribord
    */
    if (deviation < -tolerance) {
      // Différence négative : dérive à tribord. Activer relais 2 pour mettre la barre à babord (barre à roue)
      this.updateLastDeviation(deviation); // on enregistre la différence pour le tour suivant
      if (this.isBarreCentered) {
        // si la barre est centrée, on commence à actionner vers babord
        await relais2Close(device);
        this.relais2CloseTimestamp = Date.now();
        this.isBarreBabord = true;
        this.isActuatorRunning = true;
        this.isBarreCentered = false;
      } else if (this.isBarreBabord) {
        if (this.relais2ActiveTime >= this.openingTimeMaxBabord) { // si barre a babord toute
          await relais2Open(device); // on arrete la barre
          this.isActuatorRunning = false;
          this.relais2ActiveTime = this.openingTimeMaxBabord; 
        } else if (this.isDeviationBetter()===true && this.isActuatorRunning) { // ici la déviation est négative
          //sinon si le cap s'améliore et que la barre est en mouvement
          await relais2Open(device); // on l'arrete
          this.isActuatorRunning = false;
          this.relais2ActiveTime +=(Date.now() - this.relais2CloseTimestamp); // on ajoute le temps de fermeture
          this.relais2CloseTimestamp = null; // on réinitialise le début de fermeture
        } else if (this.isDeviationBetter()===false && !this.isActuatorRunning){
          // si le cap ne s'améliore pas et que le verrin est à l'arret.
          await relais2Close(device); // on rallume le verrin
          this.isActuatorRunning= true;
          this.relais2CloseTimestamp= Date.now(); // on enregistre le temps de début de refermeture
        }
        else if (this.isDeviationBetter()===false && this.isActuatorRunning) { // si le verrin est en mouvement et que le cap ne s'améliore pas
        // on ne fait rien, on compte simplement le temps d'activation
        this.relais2ActiveTime= Date.now()- this.relais2CloseTimestamp
        }
      }
else if(this.isBarreBabord){ // si la barre est à babord et que la déviation est à babord, on a un serieux problème...
console.log("on a un serieux problème babord")
}
    } 



    /* 
    Si le cap est bon
    */
    if (Math.abs(deviation)< tolerance) { // si le cap est bon
    if (this.isBarreTribord) {
      await relais1Open(device); // normalement c'est forcément le cas
      await relais2Close(device) ;// on inverse le verrin
      if (this.countnumberdeviation >2){ // si ça fait 3 fois que le bateau dérive à babord
// on va modifier le centre en diminuant le temps du relais1ActiveTime
this.relais1ActiveTime =- this.openingTimeMaxTribord/10;
console.log(" le temps de remise au centre a été modifié")
// il faut aussi modifier le temps d'ouverture maximum à tribord et l'augmenter d'autant à babord
this.openingTimeMaxTribord-=this.openingTimeMaxTribord/10
this.openingTimeMaxBabord+=this.openingTimeMaxTribord/10
      }
      setTimeout(async () => { // on le rouvre pour le ramener au centre
        relais2Open(device)
      }, this.relais1ActiveTime);
      this.relais1ActiveTime= 0 // 
      this.relais1CloseTimestamp = null;
      this.isBarreCentered = true;
      this.isBarreTribord = false;
      this.isBarreBabord = false // simple sécurité
      this.countnumberdeviation +=1;
      this.lastDeviations=[0,0]
    }
    if (this.isBarreBabord) {
      await relais2Open(device); // normalement c'est forcément le cas
      await relais1Close(device) ;// on inverse le verrin
      if (this.countnumberdeviation <-2){ // si ça fait 3 fois que le bateau dérive à tribord
// on va modifier le centre en diminuant le temps du relais1ActiveTime
this.relais2ActiveTime =- this.openingTimeMaxBabord/10;
console.log(" le temps de remise au centre a été modifié")
this.openingTimeMaxBabord-= this.openingTimeMaxBabord/10
this.openingTimeMaxTribord+= this.openingTimeMaxBabord/10
      }
      setTimeout(async () => { // on le rouvre pour le ramener au centre
        relais1Open(device)
      }, this.relais2ActiveTime);
      this.relais2ActiveTime= 0 // 
      this.relais2CloseTimestamp = null;
      this.isBarreCentered = true;
      this.isBarreTribord = false;
      this.isBarreBabord = false 
      this.countnumberdeviation -=1;
      this.lastDeviations=[0,0]
    }
    }
    
  }



  

}

export default ActuatorController;
