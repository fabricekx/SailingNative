import { View, Text, Alert, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ClickButton from "components/usefull/clickButton";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { appConfig } from "ts/appConfig";
import ActuatorControllerTest from "ts/pilotActuatorExtendRelaisClass";
import { Device } from "react-native-ble-plx";

interface ConfigTillerProps {
  myPilot: ActuatorControllerTest;
  connectedDevice: Device | null;
  // isConfigVisible: boolean;
  onCloseConfig: () => void;
}

const ConfigTiller: React.FC<ConfigTillerProps> = ({
  myPilot,
  connectedDevice,
  // isConfigVisible,
  onCloseConfig,
}) => {
  const [isBabordTribordVisible, setIsBabordTribordVisible] = useState(false);
  const [isSettingTimeMaxBabordVisible, setIsSettingTimeMaxBabordVisible] =
    useState(false);
  const [isSettingTimeMaxTribordVisible, setIsSettingTimeMaxTribordVisible] =
    useState(false);
  const [isConfigEndVisible, setIsConfigEndVisible] = useState(false);

  const [sens, setSens] = useState<boolean>(true);
  const [timeMaxBabord, setTimeMaxBabord] = useState<number | null>(null);
  const [timeMaxTribord, setTimeMaxTribord] = useState<number | null>(null);
  const timeStampClose = useRef<number | null>(null);

  const handlePressSens = () => {
    if (isBabordTribordVisible) {
    Alert.alert("Confirmation", "La barre est elle correctement centrée ?", [
      { text: "Non", style: "cancel" },
      {
        text: "Oui",
        onPress: () => {
          setIsBabordTribordVisible(false);
          setIsSettingTimeMaxBabordVisible(true);
        },
      },
    ]);}
    else {setIsBabordTribordVisible(true)}
  };

  const handlePressBabord = () => {
    if(isSettingTimeMaxBabordVisible) {
    Alert.alert(
      "Confirmation",
      "Avez vous bien relachez le bouton dès l'arrivée en butée ?",
      [
        {
          text: "Non",
          style: "cancel",
          onPress: () => {
            setIsBabordTribordVisible(true);
            setIsSettingTimeMaxBabordVisible(false);
          },
        },
        {
          text: "Oui",
          onPress: () => {
            setIsSettingTimeMaxBabordVisible(false);
            setIsSettingTimeMaxTribordVisible(true);
            appConfig.openingTimeMaxBabord = timeMaxBabord;
            appConfig.saveToStorage();
            myPilot.setTimeMaxBabord(timeMaxBabord);
            myPilot.turnToDirection("tribord", connectedDevice);
            setTimeout(
              () => myPilot.stopTurn(connectedDevice),
              timeMaxBabord
            );
          },
        },
      ]
    );}
    else (setIsSettingTimeMaxBabordVisible(true))
  };

  const handlePressTribord = () => {
    if(isSettingTimeMaxTribordVisible) {
    Alert.alert(
      "Confirmation",
      "Avez vous bien relachez le bouton dès l'arrivée en butée ?",
      [
        {
          text: "Non",
          style: "cancel", // je retourne à l'étape  de centrage
          onPress: () => {
            setIsBabordTribordVisible(true);
            setIsSettingTimeMaxTribordVisible(false);
          },
        },
        {
          text: "Oui", // j'enregistre la valeur dans appConfig et je remets la barre au centre
          onPress: () => {
            setIsSettingTimeMaxTribordVisible(false);
            setIsConfigEndVisible(true);
            appConfig.openingTimeMaxTribord = timeMaxTribord;
            appConfig.saveToStorage();
            myPilot.setTimeMaxTribord(timeMaxTribord);
            myPilot.turnToDirection("babord", connectedDevice);
            setTimeout(
              () => myPilot.stopTurn(connectedDevice),
              timeMaxTribord
            );
          },
        },
      ]
    );
  }
  else (setIsSettingTimeMaxTribordVisible(true));
}


  const BabordTribord = () => {
    const changeSens = (selectedSens: string) => {
      const newSens = selectedSens === "normal";
      setSens(newSens);
      appConfig.sens = newSens;
      appConfig.saveToStorage();
      myPilot.updateSens(newSens);
    };

    

    return (
      <View>
        <Text className="m-3 text-blue-800 dark:text-blue-400 text-2xl">1/3 Sens</Text>
        <Text className="m-3">Adaptez le sens pour que les flèches gauches et droites orientent le bateau dans la bonne direction</Text>
       
        <View className="flex flex-row items-center justify-between m-4">
          <TouchableOpacity
            onPressIn={() => {
              myPilot.turnToDirection("babord", connectedDevice);
            }}
            onPressOut={() => {
              myPilot.stopTurn(connectedDevice);
            }}
          > <Text className="text-lg">Virer babord</Text>
            <Icon name="arrow-left-bold-box" size={100} color="red" />
          </TouchableOpacity>

          <View className="flex-1 min-h-22 bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
            <Text className="flex-1 text-center">Cliquer pour modifier</Text>
          <View className="flex-1 justify-center">
          <ClickButton
          values={["normal", "inverse"]}
          selectedValue={sens ? "normal" : "inverse"}
          onChange={changeSens}
        />
        </View>
          </View>

          <TouchableOpacity
            onPressIn={() =>
              myPilot.turnToDirection("tribord", connectedDevice)
            }
            onPressOut={() => myPilot.stopTurn(connectedDevice)}
          >
                       <Text className="text-lg">Virer tribord</Text>

            <Icon name="arrow-right-bold-box" size={100} color="green" />
          </TouchableOpacity>
        </View>

        <Text className="m-2 text-lg">Placez la barre au centre avant de cliquer sur enregistrer</Text>
      </View>
    );
  };

  const SetTimeMaxBabord = () => {
   
    

    return (
      <View>
        <Text className="m-3 text-blue-800 dark:text-blue-400 text-2xl">2/3 Calibration Babord</Text>

        <Text className="m-3">
          Appuyer sur la fleche Babord jusqu'à arriver en butée et relachez
          immédiatement
        </Text>
        <Text>Duree actuelle: {timeMaxBabord? timeMaxBabord : appConfig.openingTimeMaxBabord}</Text>
        <TouchableOpacity
          onPressIn={() => {
            myPilot.turnToDirection("babord", connectedDevice);
            timeStampClose.current = Date.now();
          }}
          onPressOut={() => {
            myPilot.stopTurn(connectedDevice);
            setTimeMaxBabord(Date.now() - (timeStampClose.current ?? 0 )- 150);
          }}
        >
          <Icon name="arrow-left-bold-box" size={100} color="red" />
        </TouchableOpacity>
       
      </View>
    );
  };

  const SetTimeMaxTribord = () => {
    

    return (
      <View>
        <Text className="m-3 text-blue-800 dark:text-blue-400 text-2xl">2/3 Calibration Babord</Text>
        <Text className="m-3">
          Appuyer sur la fleche Tribord jusqu'à arriver en butée et relachez
          immédiatement
        </Text>
        <Text className="m-3">Duree actuelle: {timeMaxTribord? timeMaxTribord : appConfig.openingTimeMaxTribord}</Text>

        <View className="flex w-full items-end">
          
          {/* Bouton de droite */}

          <TouchableOpacity
          className="self-end "
            onPressIn={() => {
              myPilot.turnToDirection("tribord", connectedDevice);
              timeStampClose.current = Date.now();
            }}
            onPressOut={() => {
              myPilot.stopTurn(connectedDevice);
              setTimeMaxTribord(Date.now() - (timeStampClose.current ?? 0) - 150);
              ; // je retir 150 milliseconde pour le temps de réaction
            }}
          >
            <Icon name="arrow-right-bold-box" size={100} color="green" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ConfigEnd = () => {
    return (
      <View>
        <Text>Configuration terminée</Text>
        <TouchableOpacity onPress={onCloseConfig}>
          <Text>Terminer</Text>
        </TouchableOpacity>
      </View>
    );
  };


  // RETURN PRINCIPAL
  return (
    <View className="w-full">
      <Text className="m-3 text-blue-800 dark:text-blue-400 text-3xl">
        Configuration du pilot
      </Text>

      {isBabordTribordVisible && 
  !isSettingTimeMaxBabordVisible && 
  !isSettingTimeMaxTribordVisible && (
    <BabordTribord />
)}
      {isSettingTimeMaxBabordVisible && !isBabordTribordVisible && !isSettingTimeMaxTribordVisible &&(<SetTimeMaxBabord />)}
      {isSettingTimeMaxTribordVisible && !isSettingTimeMaxBabordVisible && !isBabordTribordVisible  && (<SetTimeMaxTribord />)}
      {/* {isConfigEndVisible && <ConfigEnd />} */}

      <View className="flex flex-row justify-between items-center">
        <View className="flex-1">
          <ClickButton
            values={["Modifier Sens", "Enregistrer"]}
            selectedValue={
              !isBabordTribordVisible ? "Modifier Sens" : "Enregistrer"
            }
            background2="bg-cyan-500"
            onChange={() =>
              {handlePressSens();
                
              }
            }
          />
        </View>
        <View className="flex-1">
          <ClickButton
            values={["Modifier Durée Babord", "Enregistrer"]}
            selectedValue={
              !isSettingTimeMaxBabordVisible
                ? "Modifier Durée Babord"
                : "Enregistrer"
            }
            background2="bg-cyan-500"

            onChange={() => handlePressBabord()   }
          />
        </View>
        <View className="flex-1">
          <ClickButton
            values={["Modifier Durée Tribord", "Enregistrer"]}
            selectedValue={
              !isSettingTimeMaxTribordVisible
                ? "Modifier Durée Tribord"
                : "Enregistrer"
            }
            background2="bg-cyan-500"

            onChange={() =>handlePressTribord()              
            }
          />
        </View>
      </View>
    </View>
  );
};

export default ConfigTiller;
