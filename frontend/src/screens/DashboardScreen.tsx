import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardOverviewScreen from './DashboardOverviewScreen';
import RequestManagerScreen from './RequestManagerScreen';
import MarketplaceScreen from './MarketplaceScreen';
import ProfileScreen from './ProfileScreen';
import { COLORS } from '../utils/styles';

const Tab = createBottomTabNavigator();

export default function DashboardScreen({ navigation }: any) {
    const handleLogout = async () => {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        navigation.replace('Login');
    };

    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.lightBackground },
                headerTintColor: COLORS.lightText,
                tabBarStyle: { backgroundColor: COLORS.lightCard, borderTopColor: '#E2E8F0' },
                tabBarActiveTintColor: COLORS.indigo,
                tabBarInactiveTintColor: COLORS.lightSubtext,
                headerShadowVisible: false,
                headerRight: () => (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                ),
            }}
        >
            <Tab.Screen 
                name="Overview" 
                component={DashboardOverviewScreen} 
                options={{ 
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-outline" color={color} size={size} />
                }} 
            />
            <Tab.Screen 
                name="Requests" 
                component={RequestManagerScreen} 
                options={{ 
                    title: 'TagAlong',
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group" color={color} size={size} />
                }} 
            />
            <Tab.Screen 
                name="Marketplace" 
                component={MarketplaceScreen} 
                options={{ 
                    title: 'Items',
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="storefront-outline" color={color} size={size} />
                }} 
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ 
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
                }} 
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    logoutButton: {
        marginRight: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: COLORS.error,
        borderRadius: 6,
    },
    logoutText: {
        color: COLORS.error,
        fontWeight: 'bold',
        fontSize: 12,
    }
});
