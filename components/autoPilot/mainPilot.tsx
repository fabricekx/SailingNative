import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Icons from 'react-native-vector-icons/Ionicons';

import { Device } from 'react-native-ble-plx';
import ActuatorControllerTest from 'ts/pilotActuatorExtendRelaisClass';
import ConfigTiller from './configTiller';
import WhenRuning from './whenRunning';

interface MainPilotProps {
  connectedDevice: Device | null;
}

const MainPilot: React.FC<MainPilotProps> = ({ connectedDevice }) => {
  const [isConfigVisible, setIsConfigVisible] = useState(false); // État pour afficher/masquer la vue contextuelle
  // const [openingTimeMaxBabord, setOpeningTimeMaxBabord] = useState<number>(3000);
  // const [openingTimeMaxTribord, setOpeningTimeMaxTribord] = useState<number>(3000);



  const myPilot = useRef<ActuatorControllerTest | null>(null);


  // Création du controller s'il n'existe pas
  if (myPilot.current === null) {
    myPilot.current = new ActuatorControllerTest();
  }
  
  

      return (
    
    <View className='flex items-center justify-between w-full'>
      <Pressable
          onPress={() => setIsConfigVisible(!isConfigVisible)}>
      <Icons name="settings-outline" size={30} color="gray" /> 
       </Pressable>
      {isConfigVisible && <ConfigTiller myPilot={myPilot.current} connectedDevice={connectedDevice} onCloseConfig={()=>setIsConfigVisible(false)}/>}


       {!isConfigVisible && <WhenRuning myPilot={myPilot.current} connectedDevice={connectedDevice}/>}

    </View>
  )
}

export default MainPilot