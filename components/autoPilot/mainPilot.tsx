import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Icons from "react-native-vector-icons/Ionicons";
import { appConfig } from "ts/appConfig";

import { Device } from "react-native-ble-plx";
import ActuatorControllerTest from "ts/pilotActuatorExtendRelaisClass";
import ConfigTiller from "./configTiller";
import WhenRuning from "./whenRunning";

interface MainPilotProps {
  connectedDevice: Device | null;
}

const MainPilot: React.FC<MainPilotProps> = ({ connectedDevice }) => {
  const [isConfigVisible, setIsConfigVisible] = useState(false); // État pour afficher/masquer la vue contextuelle
  const [modalVisible, setModalVisible] = useState(false); // pour afficher la config

  const myPilot = useRef<ActuatorControllerTest | null>(null);
  const [isPilotStarted, setIsPilotStarted] = useState(false); // à passer un composant enfant whenRunning

  // Création du controller s'il n'existe pas
  if (myPilot.current === null) {
    myPilot.current = new ActuatorControllerTest();
  }
  const handleConfig = () => {
    Alert.alert(
      "Confirmation",
      "Voulez vous procéder au calibrage du Pilot? ",
      [
        {
          text: "Non",
          style: "cancel",
          onPress: () => {
            setModalVisible(!modalVisible);
          },
        },
        {
          text: "Oui",
          onPress: () => {
            setModalVisible(!modalVisible);
            setIsConfigVisible(!isConfigVisible);
          },
        },
      ]
    );
  };
  return (
    <View className="flex items-center justify-between w-full">
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View className="flex-1 justify-center items-center ">
          <View className="m-3 p-2 bg-slate-500 rounded-lg">
            <Text className="m-3 text-center text-blue-800 dark:text-blue-400 text-3xl">
              Configuration
            </Text>
            <Text className="m-3  text-blue-800 dark:text-blue-400 text-xl">
              {" "}
              Parametres actuels
            </Text>
            <View className="m-3 p-3">
              <Text>
                {" "}
                Sens d'installation: {appConfig.sens ? "Normal" : "Inverse"}
              </Text>
              <Text> Butée Babord : {appConfig.babordActiveTimeMax}</Text>
              <Text> Butée Tribord : {appConfig.tribordActiveTimeMax}</Text>
            </View>
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setModalVisible(!modalVisible)}
                className="w-1/3 
              m-3 rounded-lg  bg-blue-500 dark:bg-blue-900"
              >
                <Text className="text-center m-1  text-white dark:text-slate-600  ">
                  Fermer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfig}
                className="w-1/3 
              m-3 rounded-lg  bg-red-500 dark:bg-red-900"
              >
                <Text className="text-center m-1  text-white dark:text-slate-600  ">
                  Configurer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {!isConfigVisible && !isPilotStarted && (
        // Logo de config
        <Pressable
          className="  absolute right-5"
          onPress={() => setModalVisible(true)}
        >
          <Icons name="settings-outline" size={30} color="gray" />
        </Pressable>
      )}

      {isConfigVisible && (
        <ConfigTiller
          myPilot={myPilot.current}
          connectedDevice={connectedDevice}
          onCloseConfig={() => setIsConfigVisible(false)}
        />
      )}

      {!isConfigVisible && (
        <WhenRuning
          myPilot={myPilot.current}
          connectedDevice={connectedDevice}
          isPilotStarted={isPilotStarted}
          setIsPilotStarted={setIsPilotStarted}
        />
      )}
    </View>
  );
};

export default MainPilot;
