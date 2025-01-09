import { View, Text, Modal, Alert, Pressable } from 'react-native'
import React, { useState } from 'react'
import ClickButton from 'components/usefull/clickButton';
import { appConfig } from 'ts/appConfig'; // importation de l'objet AppConfig, qui est mon instance unique de la classe Config



const ConfigTiller = () => {
    const [isBabordTribordVisible, setIsBabordTribordVisible]= useState(true);
    const [sens, setSens]=  useState<boolean>(true);
    const BabordTribord =() => {
      const changeSens = (selectedSens: string) => {setSens(selectedSens==="normal"); // true si normal
appConfig.sens=sens;
appConfig.saveToStorage();
      } 
        return (
            <View>
                <Text>Installation babord ou tribord</Text>
                <Text> Appuyer sur les fleches gauche et droite pour vérifier que la barre commande correctement le bateau</Text>
            <ClickButton values={["normal","inverse"]}
            selectedValue={sens? "normal" : "inverse"} text={"Inverser sens"} onChange={changeSens} />
            </View>
        )
    }
  return (
       
      <View >
        <Text className="text-xl text-blue-800 dark:text-blue-400">Configuration du pilot</Text>
        {isBabordTribordVisible && <BabordTribord/>}
        <Pressable className=" w-20 min-h-10 items-center bg-white dark:bg-slate-600 rounded-lg p-2 m-2"
          onPress={() => setIsBabordTribordVisible(false)}>
          <Text >Suivant</Text>
        </Pressable>
        <Text>Sens: {sens ? 'normal' : 'inverse'}</Text>
      </View>
    
  
  )



}

export default ConfigTiller