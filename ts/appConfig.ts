import Config from "./config";
export const appConfig = new Config(); // création d'une instance unique de configuration
// que je peux appeler partout dans mon code

export const loadAppConfig = async () => {
    const loadedConfig = await Config.loadFromStorage();
    Object.assign(appConfig, loadedConfig);
    console.log("appConfig d: ", appConfig)
  };