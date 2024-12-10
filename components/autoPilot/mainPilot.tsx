import { View, Text, TouchableOpacity } from 'react-native'
import React,  {useState} from 'react'
import Compas from 'components/navigation/compas'
import relais from "ts/relais";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Device } from 'react-native-ble-plx';

interface MainPilotProps {  connectedDevice: Device | null;
}
const MainPilot: React.FC<MainPilotProps>= ({connectedDevice}) => {
    const {relais1Close, relais1Open, relais2Close, relais2Open, relais1State, relais2State} = relais();
const [heading, setHeading] = useState<number | null>(null);
    const [CapAsked, setCapAsked] = useState<number | null>(null)
    const [isPilotStarted, setIsPilotSarted] = useState<boolean>(false);
    const startPilot = () => {setCapAsked(heading), setIsPilotSarted(true)};
    const stopPilot = () => {setIsPilotSarted(false)};
    const handleHeadingChange = (newHeading: number | null) => { // fonction transmise comme props au composant enfant Compas
        setHeading(newHeading);
      }; 
      
      return (
    
    <View>
        <Text>Compas</Text>
        <Compas onHeadingChange={handleHeadingChange}/>
        {/* <Text>Pilot</Text>
        <TouchableOpacity onPress={isPilotStarted? startPilot:stopPilot}><Text className="text-5xl text-black dark:text-slate-400">
       {isPilotStarted? <View>
        <Text className="text-4xl text-black dark:text-slate-400"> {CapAsked}°</Text>
        <Text>Click to Stop</Text></View>
             : "Start"}
       </Text>
        </TouchableOpacity> */}
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