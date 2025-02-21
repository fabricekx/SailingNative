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
  const [isBabordTribordVisible, setIsBabordTribordVisible] = useState(true);
  const [isCenterHandleVisible, setIsCenterHandleVisible] = useState(false);
  const [isSettingTimeMaxBabordVisible, setIsSettingTimeMaxBabordVisible] =
    useState(false);
  const [isSettingTimeMaxTribordVisible, setIsSettingTimeMaxTribordVisible] =
    useState(false);
  const [isConfigEndVisible, setIsConfigEndVisible] = useState(false);
  const [step, setStep] = useState<string>("");
  const [sens, setSens] = useState<boolean>(appConfig.sens);
  const [timeMaxBabord, setTimeMaxBabord] = useState<number | null>(null);
  const [timeMaxTribord, setTimeMaxTribord] = useState<number | null>(null);
  const timeStampClose = useRef<number | null>(null);

  const handlePressSens = () => {
    
      Alert.alert("Confirmation", "La barre est elle correctement centrée ?", [
        { text: "Non", style: "cancel" },
        {
          text: "Oui",
          onPress: () => {
            setIsBabordTribordVisible(false);
            setIsSettingTimeMaxBabordVisible(true);
            setStep("babord");
          },
        },
      ]);
    
  };

  const handlePressBabord = () => {
    
      Alert.alert(
        "Confirmation",
        "Avez vous bien relachez le bouton dès l'arrivée en butée ?",
        [
          {
            text: "Non",
            style: "cancel",
            onPress: () => {
              setIsCenterHandleVisible(true);
              setIsSettingTimeMaxBabordVisible(false);
            },
          },
          {
            text: "Oui",
            onPress: () => {
              setIsSettingTimeMaxBabordVisible(false);
              setStep("tribord");
              setIsCenterHandleVisible(true);
              appConfig.openingTimeMaxBabord = timeMaxBabord;
              appConfig.saveToStorage();
              myPilot.setTimeMaxBabord(timeMaxBabord);
            },
          },
        ]
      );
    
  };

  const handlePressTribord = () => {

      Alert.alert(
        "Confirmation",
        "Avez vous bien relachez le bouton dès l'arrivée en butée ?",
        [
          {
            text: "Non",
            style: "cancel", // je retourne à l'étape  de centrage
            onPress: () => {
              setIsCenterHandleVisible(true);
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
            },
          },
        ]
      );

  };

  const handlePressSuivant = () => {
    console.log("Step actuel :", step);
    if (step === "babord") {
      setIsCenterHandleVisible(false);
      setIsSettingTimeMaxBabordVisible(true);
    }
    if (step === "tribord") {
      setIsCenterHandleVisible(false);
      setIsSettingTimeMaxTribordVisible(true);
    }
  };

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
        <Text className="m-3 text-blue-800 dark:text-blue-400 text-2xl">
          1/3 Sens
        </Text>
        <Text className="m-3">
          Adaptez le sens pour que les flèches gauches et droites orientent le
          bateau dans la bonne direction
        </Text>

        <View className="flex flex-row items-center justify-between m-4">
          <TouchableOpacity
            onPressIn={() => {
              myPilot.turnToDirection("babord", connectedDevice);
            }}
            onPressOut={() => {
              myPilot.stopTurn(connectedDevice);
            }}
          >
            {" "}
            <Text className="text-lg">Virer babord</Text>
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

        <Text className="m-2 text-lg">
          Placez la barre au centre avant de cliquer sur enregistrer
        </Text>
      </View>
    );
  };

  const CenterHandle = () => {
    return (
      <View>
        <Text className="m-3 text-blue-800 dark:text-blue-400 text-2xl">
          Veuillez centrer la barre
        </Text>

        <View className="flex flex-row items-center justify-between m-4">
          <TouchableOpacity
            onPressIn={() => {
              myPilot.turnToDirection("babord", connectedDevice);
            }}
            onPressOut={() => {
              myPilot.stopTurn(connectedDevice);
            }}
          >
            <Icon name="arrow-left-bold-box" size={100} color="red" />
          </TouchableOpacity>

          <View className="flex-1 min-h-22 bg-white dark:bg-slate-600 rounded-lg p-2 m-2">
            <Text className="flex-1 text-center">Centrez la barre</Text>
            <View className="flex-1 justify-center"></View>
          </View>

          <TouchableOpacity
            onPressIn={() =>
              myPilot.turnToDirection("tribord", connectedDevice)
            }
            onPressOut={() => myPilot.stopTurn(connectedDevice)}
          >
            <Icon name="arrow-right-bold-box" size={100} color="green" />
          </TouchableOpacity>
        </View>

        <Text className="m-2 text-lg">
          Placez la barre au centre avant de cliquer sur suivant
        </Text>
      </View>
    );
  };

  const SetTimeMaxBabord = () => {
    return (
      <View>
        <Text className="m-3 text-blue-800 dark:text-blue-400 text-2xl">
          2/3 Calibration Babord
        </Text>

        <Text className="m-3">
          Appuyer sur la fleche Babord jusqu'à arriver en butée et relachez
          immédiatement
        </Text>
        <Text>
          Duree actuelle:{" "}
          {timeMaxBabord ? timeMaxBabord : appConfig.openingTimeMaxBabord}
        </Text>
        <TouchableOpacity
          className="m-5"
          onPressIn={() => {
            myPilot.turnToDirection("babord", connectedDevice);
            timeStampClose.current = Date.now();
          }}
          onPressOut={() => {
            myPilot.stopTurn(connectedDevice);
            setTimeMaxBabord(Date.now() - (timeStampClose.current ?? 0) - 150);
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
        <Text className="m-3 text-blue-800 dark:text-blue-400 text-2xl">
          2/3 Calibration Babord
        </Text>
        <Text className="m-3">
          Appuyer sur la fleche Tribord jusqu'à arriver en butée et relachez
          immédiatement
        </Text>
        <Text className="m-3">
          Duree actuelle:{" "}
          {timeMaxTribord ? timeMaxTribord : appConfig.openingTimeMaxTribord}
        </Text>

        <View className="flex w-full items-end">
          {/* Bouton de droite */}

          <TouchableOpacity
            className="self-end m-5"
            onPressIn={() => {
              myPilot.turnToDirection("tribord", connectedDevice);
              timeStampClose.current = Date.now();
            }}
            onPressOut={() => {
              myPilot.stopTurn(connectedDevice);
              setTimeMaxTribord(
                Date.now() - (timeStampClose.current ?? 0) - 150
              ); // je retir 150 milliseconde pour le temps de réaction
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
      <View className="m-3 ">
        <Text className="m-3 text-center text-lg">Félicitation, la configuration terminée ! </Text>
        <View className="flex items-center">
        <TouchableOpacity
                      className="m-5 w-1/3  px-4 py-2 rounded-lg  bg-blue-500 dark:bg-blue-900"

          onPress={ onCloseConfig}
        >
          <Text className="text-center m-1  text-white dark:text-slate-600 text-xl ">Terminer</Text>
        </TouchableOpacity>
        </View>
      </View>
    );
  };

  // RETURN PRINCIPAL
  return (
    <View className="w-full">
      <Text className="m-3 text-center text-blue-800 dark:text-blue-400 text-3xl">
        Configuration du pilot
      </Text>

      {isBabordTribordVisible && <BabordTribord />}
      {isSettingTimeMaxBabordVisible && <SetTimeMaxBabord />}
      {isSettingTimeMaxTribordVisible && <SetTimeMaxTribord />}
      {isCenterHandleVisible && <CenterHandle />}
      {isConfigEndVisible && <ConfigEnd />}

      <View className="flex flex-row justify-between items-center">
        {/* Rendu conditionnel des boutons */}
        {isBabordTribordVisible && (
           <View className="flex-1 justify-center items-center">
           <TouchableOpacity
             onPress={handlePressSens}
             className="w-1/3  px-4 py-2 rounded-lg bg-cyan-500"
           >
             <Text className="text-center m-1  text-white dark:text-slate-600 text-xl ">
               Enregistrer
             </Text>
           </TouchableOpacity>
         </View>
        )}

        {isSettingTimeMaxBabordVisible && (
           <View className="flex-1 justify-center items-center">
           <TouchableOpacity
             onPress={handlePressBabord}
             className="w-1/3  px-4 py-2 rounded-lg bg-cyan-500"
           >
             <Text className="text-center m-1  text-white dark:text-slate-600 text-xl ">
               Enregistrer
             </Text>
           </TouchableOpacity>
         </View>
        )}

        {isSettingTimeMaxTribordVisible && (
          <View className="flex-1 justify-center items-center">
          <TouchableOpacity
            onPress={handlePressTribord}
            className="w-1/3  px-4 py-2 rounded-lg bg-cyan-500"
          >
            <Text className="text-center m-1  text-white dark:text-slate-600 text-xl ">
              Enregistrer
            </Text>
          </TouchableOpacity>
        </View>
        )}
        {isCenterHandleVisible && (
          <View className="flex-1 justify-center items-center">
            <TouchableOpacity
              onPress={handlePressSuivant}
              className="w-1/4  px-4 py-2 rounded-lg  bg-blue-500 dark:bg-blue-900"
            >
              <Text className="text-center m-1  text-white dark:text-slate-600 text-xl ">
                Suivant
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default ConfigTiller;
