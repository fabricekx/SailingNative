import { Device } from 'react-native-ble-plx';


function pilotActuator(
    askedCap: number,
    Cap: number,
    tolerance: number,
    relais1Close: (device: Device) => Promise<void>,
    relais1Open: (device: Device) => Promise<void>,
    relais2Close: (device: Device) => Promise<void>,
    relais2Open: (device: Device) => Promise<void>,
    relais1State:  boolean,
    relais2State:  boolean,
    device: Device // Ajout de l'appareil comme paramètre

  ) {
    const delta = askedCap - Cap;
  
    if (Math.abs(delta) > tolerance) {
        if (delta > 0) {
          relais1Close(device); // On passe `device` ici
        } else {
          relais2Close(device); // Et ici
        }
      }
      else { relais1State && relais1Open(device); relais2State && relais2Open(device)}
  }
  
  export default pilotActuator;
  