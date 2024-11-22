import "../../global.css";
import { Slot, Stack, Tabs } from "expo-router";
import { View, Text, Image, useColorScheme } from 'react-native'
import icons from "constants/icons"

// création d'un composant paramétrable
const TabIcon= ({icon, color, name, focused}) => {
  return (
    <View className='items-center justify-center gap-2'>
      <Image className={` item-center ${focused ? " w-8 h-8" : "w-6 h-6"}`}
      source={icon}
      resizeMode='contain'
      /> 
<Text className={`${focused ? "font-semibold" : "font-normal"} text-xs dark:color-white`}>
  {name}
</Text>
    </View>
  )
}
export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
    screenOptions={{
      tabBarShowLabel: false,
      tabBarActiveBackgroundColor: colorScheme==="dark" ? "#2b2828" : "#3e7bab",
      tabBarInactiveBackgroundColor: colorScheme==="dark" ? "#000" : "#ffffff",
      tabBarInactiveTintColor : colorScheme==="dark" ? "#910901" : "#3e7bab",
      tabBarActiveTintColor: colorScheme==="dark" ? "#d1b906" : "#c96522",
      tabBarStyle: {
        borderTopColor: '#3e7bab',
        borderTopWidth: 2,
        height: 64
      }
    }}>
<Tabs.Screen name="meteo" options = {{
title: "Meteo",
// headerShown: false,
tabBarIcon: ({color,focused}) => (
  <TabIcon 
  icon = {icons.weather}
  color = {color}
  name = "Meteo"
  focused = {focused} 
  />
)

      }}
/>

<Tabs.Screen name="navigation" options = {{
title: "Navigation",
headerShown: false,
tabBarIcon: ({color,focused}) => (
  <TabIcon
  icon = {icons.navigation}
  color = {color}
  name = "Nav"
  focused = {focused} 
     
  />
)

      }}
/>
    </Tabs>
  )
}