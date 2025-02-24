import { View, Text, TouchableOpacity, Pressable } from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import Compas from "components/navigation/compas";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Slider from "@react-native-community/slider";

import { Device } from "react-native-ble-plx";
import ActuatorControllerTest from "ts/pilotActuatorExtendRelaisClass";
import { CapContext } from "@/app/capContext";

interface WhenRunningProps {
  myPilot: ActuatorControllerTest;
  connectedDevice: Device | null;
  isPilotStarted: boolean;
  setIsPilotStarted: (value: boolean) => void; // Fonction qui prend un boolean
}

const WhenRuning: React.FC<WhenRunningProps> = ({
  myPilot,
  connectedDevice,
  isPilotStarted,
  setIsPilotStarted,
}) => {
  const capContext = useContext(CapContext);

  if (!capContext) {
    throw new Error("MainPilot must be used within a CapProvider");
  }

  // const [heading, setHeading] = useState<number | null>(null);
  const { heading, setHeading, course, setCourse } = capContext; // valeurs provenant du context

  const [capAsked, setCapAsked] = useState<number | null>(null);
  const [tolerance, setTolerance] = useState<number>(10);

  const startPilot = () => {
    if (heading !== null) {
      setCapAsked(heading);
      setIsPilotStarted(true);
    } else {
      console.warn("Impossible de démarrer le pilote : heading est null");
    }
  };

  const stopPilot = (connectedDevice: Device) => {
    setIsPilotStarted(false);
    myPilot.stopTurn(connectedDevice);
    myPilot.clearIsTurning();
    myPilot.clearActiveTime();
    myPilot.clearTimeStamps();
  };

  //  pour s'assurer que le pilotActuator soit appelé si il y a un changement de cap, d'activation etc et qu'il utilise
  // des valeurs actuelles, on le met dans un useEffect
  useEffect(() => {
    if (isPilotStarted && heading !== null && capAsked !== null) {
      myPilot.pilotActuator(
        capAsked, // il faut que ces fonctions qui appellent les hook soient passées en argument de la fonction principale.
        heading,
        tolerance,

        connectedDevice
      );
    }
  }, [isPilotStarted, heading, capAsked]);

  return (
    <View className="flex items-center justify-between">
      <Compas />
      <View className="flex flex-row items-center justify-between">
        {/* Bouton gauche: si PilotStarted on modifiel le CapAsked, sinon on actionne le verrin */}
        <TouchableOpacity
          onPressIn={
            isPilotStarted
              ? () => {
                  setCapAsked(capAsked - 5);
                  capAsked < 0 && setCapAsked(capAsked + 360);
                }
              : () => myPilot.turnToDirection("babord", connectedDevice)
          }
          onPressOut={
            isPilotStarted ? undefined : () => myPilot.stopTurn(connectedDevice)
          }
        >
          {isPilotStarted ? (
            <View className=" w-[75px] h-[77px] rounded-lg p-2 m-2 bg-red-700">
              <Text className=" text-5xl text-slate-400 text-center pt-3">
                -5
              </Text>
            </View>
          ) : (
            <Icon name="arrow-left-bold-box" size={100} color="red" />
          )}
        </TouchableOpacity>

        {/* Boutton start pilot, affiche start ou le cap demandé */}
        <TouchableOpacity
          className=" w-40 min-h-32 items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2"
          onPress={() => {
            if (isPilotStarted) {
              stopPilot(connectedDevice);
            } else {
              startPilot();
            }
          }}
        >
          {isPilotStarted ? (
            <View className=" flex-1 justify-between items-center">
              <Text className="text-xl text-blue-800 dark:text-blue-400">
                Pilot
              </Text>
              <Text className="text-4xl text-green-500 dark:text-green-900">
                {" "}
                {capAsked.toFixed(0)}°
              </Text>
              <Text>Click to Stop</Text>
            </View>
          ) : (
            <View className="flex-1 ">
              <Text className="text-xl text-blue-800 dark:text-blue-400">
                Pilot{" "}
              </Text>
              <Text className="text-4xl text-black dark:text-slate-400">
                Start
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bouton de droite */}
        <TouchableOpacity
          onPressIn={
            isPilotStarted
              ? () => {
                  setCapAsked(capAsked + 5);
                  capAsked > 360 && setCapAsked(capAsked - 360);
                }
              : () => myPilot.turnToDirection("tribord", connectedDevice)
          }
          onPressOut={
            isPilotStarted ? undefined : () => myPilot.stopTurn(connectedDevice)
          }
        >
          {isPilotStarted ? (
            <View className=" w-[75px] h-[77px] rounded-lg p-2 m-2 bg-green-700">
              <Text className=" text-5xl text-slate-400 text-center pt-3">
                +5
              </Text>
            </View>
          ) : (
            <Icon name="arrow-right-bold-box" size={100} color="green" />
          )}{" "}
        </TouchableOpacity>
      </View>
      <View>
        <Text>Tolérance : {tolerance.toFixed(1)}°</Text>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={5}
          maximumValue={20}
          step={5}
          value={tolerance}
          onValueChange={(value) => setTolerance(value)}
          minimumTrackTintColor="#1EB1FC"
          maximumTrackTintColor="#8E8E93"
          thumbTintColor="#1EB1FC"
        />
        <Text>Reactivité:</Text>
      </View>
    </View>
  );
};

export default WhenRuning;
