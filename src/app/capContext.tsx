// capContext.tsx
import React, { createContext, Dispatch, SetStateAction, useState } from 'react';

// Définition de l'interface pour le contexte
interface CapContextProps {
  heading: number | null;
  setHeading: Dispatch<SetStateAction<number | null>>;
  course: number | null;
  setCourse: Dispatch<SetStateAction<number | null>>;
}

// Création du contexte avec une valeur par défaut
const CapContext = createContext<CapContextProps>({
  heading: null,
  setHeading: () => {}, // Fonction par défaut ne faisant rien
  course: null,
  setCourse: () => {}, // Fonction par défaut ne faisant rien
});

// Fournisseur du contexte
const CapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [heading, setHeading] = useState<number | null>(null);
  const [course, setCourse] = useState<number | null>(null);

  return (
    <CapContext.Provider value={{ heading, setHeading, course, setCourse }}>
      {children}
    </CapContext.Provider>
  );
};

export  { CapContext, CapProvider };
