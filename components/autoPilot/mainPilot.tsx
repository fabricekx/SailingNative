import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Compas from 'components/navigation/compas'
import relais from "ts/relais";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Device } from 'react-native-ble-plx';

interface MainPilotProps {  connectedDevice: Device | null;
}
const MainPilot: React.FC<MainPilotProps>= ({connectedDevice}) => {
    const {relais1Close, relais1Open, relais2Close, relais2Open, relais1State, relais2State} = relais();

  return (
    
    <View>
        <TouchableOpacity><Compas/></TouchableOpacity>
        <TouchableOpacity  
              onPressIn={ () => relais1Close(connectedDevice)} onPressOut={() => relais1Open(connectedDevice)}>
<Icon name="arrow-left-bold-box" size={100} color="red" />          </TouchableOpacity>
<TouchableOpacity 
              onPressIn={ () => relais2Close(connectedDevice)} onPressOut={() => relais2Open(connectedDevice)}>
<Icon name="arrow-right-bold-box" size={100} color="green" />          </TouchableOpacity>
    </View>
  )
}

export default MainPilot