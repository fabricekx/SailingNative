import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

interface ClickButtonProps {
  values: [string, string]; 
  text?: string;
  onChange ?: (selectedValue: string)=>void
}

const ClickButton: React.FC<ClickButtonProps> = ({ values, text, onChange }) => {
  const [value, setValue] = useState(values[0]);

  const onPress = () => {
    const newValue = value === values[0] ? values[1] : values[0];
    setValue(newValue); // Mettre à jour la valeur
    if (onChange) {  // onChange est optionnel
      onChange(newValue); // Passer la nouvelle valeur au parent
    }
  };

  return (
    <View className=" m-3 flex-row justify-around">
      <Text className="mb-2 text-xl text-slate-900 dark:text-slate-600">
        {text}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        className= {` px-4 py-2 w-1/4 bg-blue-500 dark:bg-blue-900 rounded-md ` }
      >
        <Text className="text-white dark:text-slate-600 text-xl">{value}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClickButton;
