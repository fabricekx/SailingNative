import { View, Text , SafeAreaView} from 'react-native'
import React, { useState } from 'react'
import Compas from 'components/navigation/compas'
import Course from 'components/navigation/course'
import ClickButton from 'components/usefull/clickButton'

const navigation = () => {
  const [unit, setUnit] = useState<string>("Noeuds"); 
  const changeUnit = (selectedUnit:string) => {setUnit(selectedUnit)}

  return (
    <SafeAreaView className="bg-slate-400 dark:bg-slate-900 flex-1 ">
   
        <ClickButton values={["Noeuds","Km/h"]} text={"Vitesse en: "}
        onChange={changeUnit}
        />
        <View className=' flex-1  items-center'>
        <Compas/>
        <Course unit={unit}/>
        </View>
    </SafeAreaView>
  )
}

export default navigation