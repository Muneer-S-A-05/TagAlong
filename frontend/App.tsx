import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RequestDetailScreen from './src/screens/RequestDetailScreen';
import MarketplaceDetailScreen from './src/screens/MarketplaceDetailScreen';
import MarketplaceEditScreen from './src/screens/MarketplaceEditScreen';
import RequestEditScreen from './src/screens/RequestEditScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import { COLORS } from './src/utils/styles';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    // Basic check for existing token to route appropriately
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          setInitialRoute('Dashboard');
        } else {
          setInitialRoute('Login');
        }
      } catch (e) {
        setInitialRoute('Login');
      }
    };
    checkToken();
  }, []);

  if (!initialRoute) return null; // Loading state could go here

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={COLORS.obsidian} />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.obsidian },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
        <Stack.Screen name="MarketplaceDetail" component={MarketplaceDetailScreen} />
        <Stack.Screen name="MarketplaceEdit" component={MarketplaceEditScreen} />
        <Stack.Screen name="RequestEdit" component={RequestEditScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
