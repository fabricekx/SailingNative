import SensorFusionProvider, { useSensorFusion, useCompass, toDegrees } from 'react-native-sensor-fusion';
const Indicator = () => {
    const { ahrs } = useSensorFusion();
    const { heading, pitch, roll } = ahrs.getEulerAngles(); // heading: cap ajusté après calcul de l'inclinaison du téléphone
    const compass = useCompass(); // si telephone est à plat

    return {heading, pitch, roll, compass}

}

    export default Indicator