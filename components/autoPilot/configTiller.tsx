import { View, Text, Alert, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ClickButton from "components/usefull/clickButton";
import { appConfig } from "ts/appConfig";
import { Device } from "react-native-ble-plx";
import ActuatorControllerTest from "ts/pilotActuatorExtendRelaisClass";

enum ConfigStep {
  Sens = "sens",
  Center = "center",
  Babord = "babord",
  Tribord = "tribord",
  End = "end",
}

interface ConfigTillerProps {
  myPilot: ActuatorControllerTest;
  connectedDevice: Device | null;
  onCloseConfig: () => void;
}

const ConfigTiller: React.FC<ConfigTillerProps> = ({ myPilot, connectedDevice, onCloseConfig }) => {
  const [step, setStep] = useState<ConfigStep>(ConfigStep.Sens);
  const [sens, setSens] = useState<boolean>(appConfig.sens);
  const [timeMaxBabord, setTimeMaxBabord] = useState<number | null>(null);
  const [timeMaxTribord, setTimeMaxTribord] = useState<number | null>(null);
  const timeStampClose = useRef<number | null>(null);

  const handlePressSens = () => {
    Alert.alert("Confirmation", "La barre est-elle centrée ?", [
      { text: "Non", style: "cancel" },
      {
        text: "Oui",
        onPress: () => setStep(ConfigStep.Babord),
      },
    ]);
  };

  const handlePressBabord = () => {
    Alert.alert("Confirmation", "Relâché à la butée ?", [
      {
        text: "Non",
        style: "cancel",
        onPress: () => setStep(ConfigStep.Center),
      },
      {
        text: "Oui",
        onPress: () => {
          if (timeMaxBabord !== null) {
            appConfig.babordActiveTimeMax = timeMaxBabord;
            appConfig.saveToStorage();
            myPilot.setTimeMaxBabord(timeMaxBabord);
            setStep(ConfigStep.Center);
          }
        },
      },
    ]);
  };

  const handlePressTribord = () => {
    Alert.alert("Confirmation", "Relâché à la butée ?", [
      {
        text: "Non",
        style: "cancel",
        onPress: () => setStep(ConfigStep.Center),
      },
      {
        text: "Oui",
        onPress: () => {
          if (timeMaxTribord !== null) {
            appConfig.tribordActiveTimeMax = timeMaxTribord;
            appConfig.saveToStorage();
            myPilot.setTimeMaxTribord(timeMaxTribord);
            myPilot.turnToDirection("babord", connectedDevice); // recentrage
            setStep(ConfigStep.End);
          }
        },
      },
    ]);
  };

  const changeSens = (selectedSens: string) => {
    const newSens = selectedSens === "normal";
    setSens(newSens);
    appConfig.sens = newSens;
    appConfig.saveToStorage();
    myPilot.updateSens(newSens);
  };

  // === COMPOSANTS ===
  const renderStep = () => {
    switch (step) {
      case ConfigStep.Sens:
        return (
          <View>
            <Text className="m-3 text-2xl text-blue-800 dark:text-blue-400">1/3 Sens</Text>
            <Text className="m-3">Adaptez le sens pour que les flèches agissent correctement</Text>

            <View className="flex flex-row items-center justify-between m-4">
              <TouchableOpacity
                onPressIn={() => myPilot.turnToDirection("babord", connectedDevice)}
                onPressOut={() => myPilot.stopTurn(connectedDevice)}
              >
                <Text className="text-lg">Babord</Text>
                <Icon name="arrow-left-bold-box" size={100} color="red" />
              </TouchableOpacity>

              <ClickButton
                values={["normal", "inverse"]}
                selectedValue={sens ? "normal" : "inverse"}
                onChange={changeSens}
              />

              <TouchableOpacity
                onPressIn={() => myPilot.turnToDirection("tribord", connectedDevice)}
                onPressOut={() => myPilot.stopTurn(connectedDevice)}
              >
                <Text className="text-lg">Tribord</Text>
                <Icon name="arrow-right-bold-box" size={100} color="green" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handlePressSens} className="m-4 bg-cyan-500 p-3 rounded-lg">
              <Text className="text-white text-center">Enregistrer</Text>
            </TouchableOpacity>
          </View>
        );

      case ConfigStep.Babord:
        return (
          <View>
            <Text className="m-3 text-2xl text-blue-800 dark:text-blue-400">2/3 Calibration Babord</Text>
            <Text className="m-3">Appuyez jusqu'à la butée, puis relâchez</Text>

            <TouchableOpacity
              onPressIn={() => {
                myPilot.turnToDirection("babord", connectedDevice);
                timeStampClose.current = Date.now();
              }}
              onPressOut={() => {
                myPilot.stopTurn(connectedDevice);
                setTimeMaxBabord(Date.now() - (timeStampClose.current ?? 0) - 150);
              }}
              className="m-4"
            >
              <Icon name="arrow-left-bold-box" size={100} color="red" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePressBabord} className="m-4 bg-cyan-500 p-3 rounded-lg">
              <Text className="text-white text-center">Enregistrer</Text>
            </TouchableOpacity>
          </View>
        );

      case ConfigStep.Center:
        return (
          <View>
            <Text className="m-3 text-2xl text-blue-800 dark:text-blue-400">Centrer la barre</Text>
            <View className="flex flex-row justify-around m-4">
              <TouchableOpacity
                onPressIn={() => myPilot.turnToDirection("babord", connectedDevice)}
                onPressOut={() => myPilot.stopTurn(connectedDevice)}
              >
                <Icon name="arrow-left-bold-box" size={100} color="red" />
              </TouchableOpacity>

              <TouchableOpacity
                onPressIn={() => myPilot.turnToDirection("tribord", connectedDevice)}
                onPressOut={() => myPilot.stopTurn(connectedDevice)}
              >
                <Icon name="arrow-right-bold-box" size={100} color="green" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setStep(step === ConfigStep.Center && timeMaxBabord ? ConfigStep.Tribord : ConfigStep.Babord)}
              className="m-4 bg-blue-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center">Suivant</Text>
            </TouchableOpacity>
          </View>
        );

      case ConfigStep.Tribord:
        return (
          <View>
            <Text className="m-3 text-2xl text-blue-800 dark:text-blue-400">3/3 Calibration Tribord</Text>
            <Text className="m-3">Appuyez jusqu'à la butée, puis relâchez</Text>

            <TouchableOpacity
              onPressIn={() => {
                myPilot.turnToDirection("tribord", connectedDevice);
                timeStampClose.current = Date.now();
              }}
              onPressOut={() => {
                myPilot.stopTurn(connectedDevice);
                setTimeMaxTribord(Date.now() - (timeStampClose.current ?? 0) - 150);
              }}
              className="m-4 self-end"
            >
              <Icon name="arrow-right-bold-box" size={100} color="green" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePressTribord} className="m-4 bg-cyan-500 p-3 rounded-lg">
              <Text className="text-white text-center">Enregistrer</Text>
            </TouchableOpacity>
          </View>
        );

      case ConfigStep.End:
        return (
          <View className="m-3 items-center">
            <Text className="text-center text-lg">🎉 Configuration terminée !</Text>
            <TouchableOpacity onPress={onCloseConfig} className="m-4 bg-blue-500 p-3 rounded-lg">
              <Text className="text-white text-center">Terminer</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="w-full">
      <Text className="m-3 text-center text-3xl text-blue-800 dark:text-blue-400">
        Configuration du pilote
      </Text>
      {renderStep()}
    </View>
  );
};

export default ConfigTiller;
