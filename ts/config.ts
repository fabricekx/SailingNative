import AsyncStorage from '@react-native-async-storage/async-storage';


class Config {
    public sens: boolean = true;
    public openingTimeMaxTribord: number = 3000;
    public openingTimeMaxBabord: number = 3000;
  
    constructor(initialValues?: Partial<Config>) {
      if (initialValues) {
        Object.assign(this, initialValues); // Permet d'initialiser avec des valeurs personnalisées
      }
    }

    async saveToStorage() { // a utiliser quand on modifie des données de configuration
        try {
          await AsyncStorage.setItem('config', JSON.stringify(this));
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de la configuration', error);
        }
      }
    
      static async loadFromStorage(): Promise<Config> { // a utiliser à la racine du projet, pour importer la config
        try {
          const configString = await AsyncStorage.getItem('config');
          if (configString) {
            const configObject = JSON.parse(configString);
            return new Config(configObject);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la configuration', error);
        }
        return new Config(); // Retourne une configuration par défaut en cas d'erreur
      }
    }
    

  
  
  export default Config;
  