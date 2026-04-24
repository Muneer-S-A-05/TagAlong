import Constants from 'expo-constants';
import { Platform } from 'react-native';

const debuggerHost = Constants.expoConfig?.hostUri;
let HOST = '10.0.2.2'; // Default Android Emulator bridging mapping

if (debuggerHost) {
    // If running via Expo Go, this automatically grabs the computer's local Wi-Fi IP!
    HOST = debuggerHost.split(':')[0];
} else if (Platform.OS === 'ios') {
    HOST = 'localhost';
}

export const API_URL = `http://${HOST}:8000/api`;
