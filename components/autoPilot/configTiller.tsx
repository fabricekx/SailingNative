import { View, Text, Modal, Alert, Pressable } from 'react-native'
import React, { useState } from 'react'
import ClickButton from 'components/usefull/clickButton';
import { appConfig } from 'ts/appConfig'; // importation de l'objet AppConfig, qui est mon instance unique de la classe Config
import ActuatorController from 'ts/pilotActuator';


interface ConfigTillerProps {handleVisibleTri:(visible:boolean)  => void
  myPilot:ActuatorController // Type direct, car on passe l'instance
}

const ConfigTiller : React.FC<ConfigTillerProps> = ({handleVisibleTri, myPilot}) => {


    const [isBabordTribordVisible, setIsBabordTribordVisible]= useState(true);
    const [isTimeMaxTribordVisible, setIsTimeMaxTribordVisible]= useState(false)
   
  //  Premiere config: sens d'actionnement
    const BabordTribord =() => {
      const changeSens = (selectedSens: string) => {
        const isNormal = selectedSens === "normal";
        appConfig.sens = isNormal; // Mise à jour dans appConfig
        myPilot.updateSens(isNormal); // Mise à jour dans ActuatorController
        appConfig.saveToStorage(); // Sauvegarde
      };
        return (
            <View>
                <Text>Installation babord ou tribord</Text>
                <Text> Appuyer sur les fleches gauche et droite pour vérifier que la barre commande correctement le bateau</Text>
            
            <Text> Placez la barre parfaitement au centre avant de continuer</Text>
            <ClickButton values={["normal","inverse"]}
            selectedValue={appConfig.sens? "normal" : "inverse"} text={"Inverser sens"} onChange={changeSens} />
            <Pressable className=" w-20 min-h-10 items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2"
          onPress={() => {setIsBabordTribordVisible(false); setIsTimeMaxTribordVisible(true); handleVisibleTri(true)}}>
          <Text >Suivant</Text>
        </Pressable>
            </View>
        )
    }

    // composant temps de fermeture max tribord
const SetTimeTribord= () => {

  return (
    <View>
      <Text> Si la barre est bien placée au centre, appuyez sur le bouton Gauche jusqu'à la butée et relachez immédiatement</Text>
      <Pressable className=" w-20 min-h-10 items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2"
          onPress={() => { setIsTimeMaxTribordVisible(false); handleVisibleTri(false)}}>
          <Text >Suivant</Text>
        </Pressable>
    </View>
  )
}





    /* COMPOSANT PRINCIPAL */
  return (
       
      <View >
        <Text className="text-xl text-blue-800 dark:text-blue-400">Configuration du pilot</Text>
        {isBabordTribordVisible && <BabordTribord/>}
        {isTimeMaxTribordVisible && <SetTimeTribord/>}
        <Text>Sens: {appConfig.sens ? 'normal' : 'inverse'}</Text>
        <Text>Duree max Tribord: {appConfig.openingTimeMaxTribord}</Text>
      </View>
    
  
  )



}

export default ConfigTiller