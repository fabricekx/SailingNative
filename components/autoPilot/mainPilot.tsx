import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Compas from 'components/navigation/compas';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icons from 'react-native-vector-icons/Ionicons';
import { useRouter } from "expo-router";

import { Device } from 'react-native-ble-plx';
import ActuatorControllerTest from 'ts/pilotActuatorExtendRelaisClass';
import ConfigTiller from './configTiller';

interface MainPilotProps {
  connectedDevice: Device | null;
}

const MainPilot: React.FC<MainPilotProps> = ({ connectedDevice }) => {
  const [isConfigVisible, setIsConfigVisible] = useState(false); // État pour afficher/masquer la vue contextuelle
  // const [openingTimeMaxBabord, setOpeningTimeMaxBabord] = useState<number>(3000);
  // const [openingTimeMaxTribord, setOpeningTimeMaxTribord] = useState<number>(3000);


  const myPilot = useRef<ActuatorControllerTest | null>(null);

  const router = useRouter(); // pour navigation vers ConfigTille


  const [heading, setHeading] = useState<number | null>(null);
  const [capAsked, setCapAsked] = useState<number | null>(null);
  const [isPilotStarted, setIsPilotSarted] = useState<boolean>(false);
  // const [openingTimeMax, setOpeningTimeMax] = useState<number>(3000) // temps d'ouverture maximum des relais depuis la barre au milieu


  // Création du controller s'il n'existe pas
  if (myPilot.current === null) {
    myPilot.current = new ActuatorControllerTest();
  }
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
    if (isPilotStarted && heading !== null && capAsked !== null) {
      myPilot.current.pilotActuator( // le fait d'utiliser useRef.curent évite qu'une nouvelle instance de pilotActuator ne soit créé à chaque actualisation
        // ceci n'étant pas un composant React, et comme il fait appel à des hooks (des useState dans les relais),
        capAsked,   // il faut que ces fonctions qui appellent les hook soient passées en argument de la fonction principale.
        heading,
        10,
        
        connectedDevice,
      );
    }
  }, [isPilotStarted, heading, capAsked]);

      return (
    
    <View className='flex items-center justify-between'>
      <Pressable
        onPress={() => router.push('/ConfigTillerPage')}>
      <Icons name="settings-outline" size={30} color="gray" /> 
       </Pressable>

        <Compas onHeadingChange={handleHeadingChange}/>
        <View className='flex flex-row items-center justify-between'>



{/* Bouton gauche: si PilotStarted on modifiel le CapAsked, sinon on actionne le verrin */}
        <TouchableOpacity  
              onPressIn={isPilotStarted? () =>{setCapAsked(capAsked-5); capAsked<0 && setCapAsked(capAsked+360)}: () => myPilot.current.turnToDirection("babord", connectedDevice)} 
              
              
              onPressOut={isPilotStarted ? undefined : () => myPilot.current.stopTurn(connectedDevice)}
>
  {isPilotStarted? <View className=" w-[75px] h-[77px] rounded-lg p-2 m-2 bg-red-700"><Text className=' text-5xl text-slate-400 text-center pt-3' >-5</Text></View> : <Icon name="arrow-left-bold-box" size={100} color="red" /> }
          </TouchableOpacity>


{/* Boutton start pilot, affiche start ou le cap demandé */}
        <TouchableOpacity className=" w-40 min-h-32 items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2" onPress={isPilotStarted? stopPilot: startPilot}>
       {isPilotStarted? 
       <View className=' flex-1 justify-between items-center'>
        <Text className="text-xl text-blue-800 dark:text-blue-400">
                Pilot 
              </Text>
        <Text className="text-4xl text-green-500 dark:text-green-900"> {capAsked.toFixed(0)}°</Text>
        <Text>Click to Stop</Text>
        </View>
             :
             <View className='flex-1 '>
               <Text className="text-xl text-blue-800 dark:text-blue-400">Pilot </Text>
              <Text className="text-4xl text-black dark:text-slate-400">Start</Text>
              </View>
              }
       
        </TouchableOpacity>


{/* Bouton de droite */}
        <TouchableOpacity 
onPressIn={isPilotStarted? () =>{setCapAsked(capAsked+5); capAsked>360 && setCapAsked(capAsked-360)}: () => myPilot.current.turnToDirection("tribord", connectedDevice)} 
onPressOut={isPilotStarted ? undefined : () => myPilot.current.stopTurn(connectedDevice)}>
  {isPilotStarted? <View className=" w-[75px] h-[77px] rounded-lg p-2 m-2 bg-green-700"><Text className=' text-5xl text-slate-400 text-center pt-3' >+5</Text></View> :<Icon name="arrow-right-bold-box" size={100} color="green" />     }     </TouchableOpacity>
        </View>
        

    </View>
  )
}

export default MainPilot