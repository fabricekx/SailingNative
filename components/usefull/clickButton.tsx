import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

interface ClickButtonProps {
  values: [string, string]; 
  selectedValue: string;
  text?: string;
  onChange ?: (selectedValue: string)=>void
}

const ClickButton: React.FC<ClickButtonProps> = ({ values,selectedValue, text, onChange }) => {

  const onPress = () => {
    const newValue = selectedValue === values[0] ? values[1] : values[0];
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
        <Text className="text-white dark:text-slate-600 text-xl">{selectedValue}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClickButton;
