import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Compas from 'components/navigation/compas';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icons from 'react-native-vector-icons/Ionicons';

import { Device } from 'react-native-ble-plx';
import ActuatorController from 'ts/pilotActuator';
import ConfigTiller from './configTiller';
import {appConfig} from 'ts/appConfig';
import Relais from 'ts/relais';

// console.log('MainPilot component loaded');
// const testInstance = new ActuatorController();
// console.log(testInstance);
interface MainPilotProps {
  connectedDevice: Device | null ;
}

const MainPilot: React.FC<MainPilotProps> = ({ connectedDevice }) => {
  const [isConfigVisible, setIsConfigVisible] = useState(false); // État pour afficher/masquer la vue contextuelle

  
  

  const [heading, setHeading] = useState<number | null>(null);
  const [capAsked, setCapAsked] = useState<number | null>(null);
  const [isPilotStarted, setIsPilotSarted] = useState<boolean>(false);

  /* POUR CONFIG */
const [isTimeMaxTribordVisible,setIsTimeMaxTribordVisible]= useState<boolean>(false);
const handleIsTimeMaxTriVisible = (isVisible:boolean) => {setIsTimeMaxTribordVisible(isVisible)}
const setTimeMaxTribor = (debutTribord:number, finTribord:number) => {
  appConfig.openingTimeMaxTribord=(finTribord-debutTribord)
}
let fermeture:number;
let ouverture:number;


/* FIN CONFIG*/

// Utiliser useRef pour une instance persistante de ActuatorController
const myPilot = useRef<ActuatorController | null>(null);

useEffect(() => {
  console.log('useEffect called');
  try {
    myPilot.current = new ActuatorController();
    console.log('myPilot instance:', myPilot.current);
  } catch (error) {
    console.error('Error initializing ActuatorController:', error);
  }
}, []);


  const startPilot = () => {
    if (heading !== null) {
      setCapAsked(heading);
      setIsPilotSarted(true);
    } else {
      console.warn('Impossible de démarrer le pilote : heading est null');
    }
  };

  const stopPilot = () => {
    setIsPilotSarted(false);
  };

  const handleHeadingChange = (newHeading: number | null) => {
    setHeading(newHeading);
  };
//  pour s'assurer que le pilotActuator soit appelé si il y a un changement de cap, d'activation etc et qu'il utilise 
// des valeurs actuelles, on le met dans un useEffect
useEffect(() => {
  if (isPilotStarted && heading !== null && capAsked !== null && myPilot.current && connectedDevice !== null) {
    myPilot.current.pilotActuator(
      capAsked,
      heading,
      10,
      connectedDevice,
    );
  } else if (!myPilot.current) {
    console.warn('myPilot is not initialized');
  }
}, [isPilotStarted, heading, capAsked]);

      return (
    
    <View className='flex items-center justify-between'>
      <Pressable
          onPress={() => setIsConfigVisible(!isConfigVisible)}>
      <Icons name="settings-outline" size={30} color="gray" /> 
       </Pressable>
      {/* {isConfigVisible && myPilot.current && <ConfigTiller handleVisibleTri= {handleIsTimeMaxTriVisible}
      myPilot={myPilot.current}/>} 
      <Text>Sens {appConfig.sens}</Text> */}
        <Compas onHeadingChange={handleHeadingChange}/>
        <View className='flex flex-row items-center justify-between'>

{/* Bouton gauche: si PilotStarted on modifiel le CapAsked, sinon on actionne le verrin */}
<TouchableOpacity
  onPressIn={() => {
    if (isPilotStarted) {
      // Mode pilote démarré
      const newCap = capAsked! - 5;
      setCapAsked(newCap < 0 ? newCap + 360 : newCap);
    } else {
      // Mode manuel
      
        myPilot.current!.turnToDirection("babord",connectedDevice!);
      } 
      if (isTimeMaxTribordVisible) {
        fermeture = Date.now(); // Assurez-vous que "fermeture" est déclarée dans le scope
      }
    }
  }
  onPressOut={
    isPilotStarted
      ? undefined // Pas d'action en mode pilote
      : () => {
          // Mode manuel
          myPilot.current!.stopTurn(connectedDevice!)
          if (isTimeMaxTribordVisible) {
            ouverture = Date.now(); 
            setTimeMaxTribor(fermeture,ouverture)

          }
        }
  }
>
  {isPilotStarted ? (
    <View className="w-[75px] h-[77px] rounded-lg p-2 m-2 bg-red-700">
      <Text className="text-5xl text-slate-400 text-center pt-3">-5</Text>
    </View>
  ) : (
    <Icon name="arrow-left-bold-box" size={100} color="red" />
  )}
</TouchableOpacity>


{/* Boutton start pilot, affiche start ou le cap demandé */}
        <TouchableOpacity className=" w-40 min-h-32 items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2" onPress={isPilotStarted? stopPilot: startPilot}>
       {isPilotStarted? 
       <View className=' flex-1 justify-between items-center'>
        <Text className="text-xl text-blue-800 dark:text-blue-400">
                Pilot 
              </Text>
        <Text className="text-4xl text-green-500 dark:text-green-900"> {capAsked!.toFixed(0)}°</Text>
        <Text>Click to Stop</Text>
        </View>
             :
             <View className='flex-1 '>
               <Text className="text-xl text-blue-800 dark:text-blue-400">Pilot </Text>
              <Text className="text-4xl text-black dark:text-slate-400">Start</Text>
              </View>
              }
       
        </TouchableOpacity>



        {/* Bouton Droit */}
        <TouchableOpacity
  onPressIn={() => {
    if (isPilotStarted) {
      // Mode pilote démarré
      const newCap = capAsked! + 5;
      setCapAsked(newCap > 360 ? newCap - 360 : newCap);
    } else {
      // Mode manuel
      myPilot.current!.turnToDirection("tribord",connectedDevice!)
    }
  }}
  onPressOut={
    isPilotStarted
      ? undefined // Pas d'action en mode pilote
      : () => {
          // Mode manuel
          myPilot.current!.stopTurn(connectedDevice!)
        }
  }
>
  {isPilotStarted ? (
    <View className="w-[75px] h-[77px] rounded-lg p-2 m-2 bg-green-700">
      <Text className="text-5xl text-slate-400 text-center pt-3">+5</Text>
    </View>
  ) : (
    <Icon name="arrow-right-bold-box" size={100} color="green" />
  )}
</TouchableOpacity>

        </View>
        

    </View>
  )
}

export default MainPilot