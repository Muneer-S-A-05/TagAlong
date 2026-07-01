import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ==========================================
// 🚀 PRODUCTION VERCEL URL
// ==========================================
// Use this to connect your mobile app to the cloud database
export const API_URL = 'https://tag-along-olive.vercel.app/api';


// ==========================================
// 🛠️ LOCAL DEVELOPMENT URL
// ==========================================
// Comment out the Vercel URL above and uncomment this block if you ever 
// want to run a local python server for testing again.
/*
const debuggerHost = Constants.expoConfig?.hostUri;
let HOST = '10.0.2.2'; // Default Android Emulator bridging mapping

if (debuggerHost) {
    HOST = debuggerHost.split(':')[0];
} else if (Platform.OS === 'ios') {
    HOST = 'localhost';
}
export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${HOST}:8000/api`;
*/
