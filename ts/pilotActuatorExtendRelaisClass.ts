import { Device } from "react-native-ble-plx";
import { appConfig } from 'ts/appConfig';
import RelaisClass from "./relaisClass";


export default class ActuatorControllerTest extends RelaisClass{
  constructor() {
    super();
  
      console.log('ActuatorController instantiated');
    
  }




  async stopTurn(device: Device): Promise<void> {
    try {
      await this.openRelais1(device);
      await this.openRelais2(device);
    } catch (error) {
      console.error("Erreur lors de l'arrêt des relais :", error);
    }
  }



  

}