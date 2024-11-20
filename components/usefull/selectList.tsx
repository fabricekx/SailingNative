import React, { useState } from "react";
import { View, Text } from "react-native";
import {Picker} from '@react-native-picker/picker';

interface SelectListProps { // utiliser une interface plutôt que type quand il s'agit d'un objet
  options: string[]; // Tableau d'options
  onSelect: (selectedOption: string) => void; // Action à exécuter sur la sélection
  label?: string; // Optionnel : un label pour le SelectList
  defaultValue?: string; // Optionnel : Valeur par défaut
  className?: string
}

const SelectList: React.FC<SelectListProps> = ({ options, onSelect, label, defaultValue, className }) => {
  const [selectedValue, setSelectedValue] = useState(
    defaultValue ?? options[0]
  );

  const allOptions = defaultValue && !options.includes(defaultValue)
    ? [defaultValue, ...options] // Ajoute la valeur par défaut si elle n'existe pas dans la liste
    : options; // sinon on garde la liste de base

    const handleChange = (itemValue: string) => {
      setSelectedValue(itemValue);
      onSelect(itemValue);
    };

  return (
    // permet d'ajouter les classes optionnelles
    <View className={`p-4 ${className ?? ""}`}> 
      {/* si on a un label pn l'affiche */}
      {label && <Text className="mb-2 text-lg  text-slate-600 dark:text-slate-50  font-bold">{label}</Text>}
      <View className="border border-gray-300 rounded">
        <Picker
          selectedValue={selectedValue}
          onValueChange={handleChange}
          style={{ height: 50, width: "100%" }} // Ajout d'un style natif
        >
          {options.map((option) => (
            <Picker.Item color="grey" key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default SelectList;
