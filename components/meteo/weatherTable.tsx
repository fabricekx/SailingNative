import React, { useState } from "react";
import { View, Text } from "react-native";
import { DataTable } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { format, parseISO } from "date-fns";
import ClickButton from "components/usefull/clickButton";


const WeatherTable = ({ weatherData }) => {
  const [unit, setUnit] = useState("Noeuds");
// Gestion du changement d'unité
const changeUnit = (selectedUnit: string) => {
  setUnit(selectedUnit);
};
  const windData = weatherData.hourly;
// console.log(windData)

const formattedDate = time => {
  const parsedTime = parseISO(time);
  return format(parsedTime, "HH:mm") === "00:00"
    ? format(parsedTime, "dd/MM")
    : format(parsedTime, "HH:mm");
};

const beaufortColor = (speed: number) => { // ajout de FF pour forcer l'opacité
  if (speed < 1) return '#FFFFFF'; // 0 Beaufort
  else if (speed < 3) return '#4CD8E4FF'; // 1 Beaufort
  else if (speed < 6) return '#74FA59FF'; // 2 Beaufort
  else if (speed < 10) return '#65B626FF'; // 3 Beaufort
  else if (speed < 16) return '#FFD700FF'; // 4 Beaufort
  else if (speed < 21) return '#FF8C00FF'; // 5 Beaufort
  else if (speed < 27) return '#FB3535FF'; // 6 Beaufort
  else if (speed < 33) return '#B7273FFF'; // 7 Beaufort
  else if (speed < 40) return '#8C27B7FF'; // 8 Beaufort
  else if (speed < 47) return '#3827B7FF'; // 9 Beaufort
  else if (speed < 55) return '#02010DFF'; // 10 Beaufort
  else if (speed < 63) return '#FB3535FF'; // 11 Beaufort
  else return '#FCF156FF'; // 12 Beaufort ou plus
};

const rainColor = (rain: number) => {
  if (rain ==0) { return ''}
  else if (rain<3) {return '#8ee8e5'} // pluie faible
  else if (rain<7) {return '#f5771d'} // pluie modérée
  else { return '#f71e16'} // pluie forte
}

  return (
    <View className="bg-slate-400 dark:bg-slate-900" >
     <ClickButton values={["Noeuds","Km/h"]} 
     selectedValue={unit}
     text={"Vitesse en: "}
        onChange={changeUnit}
        />
      <DataTable>
        <DataTable.Header>
          <DataTable.Title className=" justify-center"> <Text className="text-slate-900 dark:text-slate-300">Heure</Text></DataTable.Title>
          <DataTable.Title className=" justify-center"><Text className="text-slate-900 dark:text-slate-300 ">Vent</Text><Icon name="weather-windy" size={16} color="blue" /></DataTable.Title>
          <DataTable.Title className=" justify-center"><Text className="text-slate-900 dark:text-slate-300">Rafales</Text><Icon name="weather-lightning" size={16} color="red" /></DataTable.Title>
          <DataTable.Title className=" justify-center"><Text className="text-slate-900 dark:text-slate-300 ">Dir.</Text><Icon name="compass-outline" size={16} color="orange" /></DataTable.Title>
          <DataTable.Title className=" justify-center"><Text className="text-slate-900 dark:text-slate-300">Pluie</Text>  <Icon name="weather-rainy" size={16} color="gray" /></DataTable.Title>
          <DataTable.Title className=" justify-center"><Text className="text-slate-900 dark:text-slate-300">Temp.</Text><Icon name="coolant-temperature" size={16} color="green" /></DataTable.Title>

        </DataTable.Header>

        {windData.time.map((time, index) => (
          <DataTable.Row 
          key={index}>
            <DataTable.Cell><Text className="text-slate-900 dark:text-slate-300 ">{formattedDate(time)}</Text></DataTable.Cell>
            <DataTable.Cell style= {{ backgroundColor: beaufortColor(windData.wind_speed_10m[index])  }}>
            <Text  > {unit === "Noeuds" 
    ? `${windData.wind_speed_10m[index]} Kt` 
    : `${(windData.wind_speed_10m[index] * 1.852).toFixed(0)} Km/h`} </Text>
              
            </DataTable.Cell>
            <DataTable.Cell style= {{backgroundColor: beaufortColor(windData.wind_gusts_10m[index]) }}>
            <Text  > {unit === "Noeuds" 
    ? `${windData.wind_gusts_10m[index]} Kt` 
    : `${(windData.wind_gusts_10m[index] * 1.852).toFixed(0)} Km/h`}</Text>
              
            </DataTable.Cell>
            <DataTable.Cell className=" justify-center">
            <Icon   style={{ transform: [{ rotate: `${windData.wind_direction_10m[index]}deg` }] }}  name="arrow-down-thin" size={30} color="blue" />
            </DataTable.Cell>



            <DataTable.Cell  style= {{backgroundColor: rainColor(windData.rain[index]) }}>
            <Text 
            
     >  {windData.rain[index] != 0 && `${windData.rain[index]} mm`}
            </Text>
            </DataTable.Cell>
            
            <DataTable.Cell>
            <Text className="text-slate-900 dark:text-slate-300">{windData.temperature_2m[index]} °C{" "}</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </View>
  );
};

export default WeatherTable;
