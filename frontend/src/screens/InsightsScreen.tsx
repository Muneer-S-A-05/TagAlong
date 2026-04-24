import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';

export default function InsightsScreen() {
    const [insights, setInsights] = useState([]);
    const [locName, setLocName] = useState('');
    const [crowd, setCrowd] = useState('');
    const [food, setFood] = useState('');

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await axios.get(`${API_URL}/insights/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInsights(res.data);
        } catch (error) {
            console.log('Error fetching insights', error);
        }
    };

    const createInsight = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            await axios.post(`${API_URL}/insights/`, {
                location_name: locName,
                crowd_status: crowd,
                food_status: food
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', 'Insight shared!');
            setLocName('');
            setCrowd('');
            setFood('');
            fetchInsights();
        } catch (error) {
            Alert.alert('Error', 'Could not share insight');
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, padding: 16 }}>
                <Text style={[globalStyles.title, { fontSize: 24, marginBottom: 16 }]}>Location Insights</Text>

                <View style={globalStyles.glassPanel}>
                    <TextInput style={styles.inputSmall} placeholder="Where are you? (e.g. Canteen)" placeholderTextColor="#888" value={locName} onChangeText={setLocName} />
                    <TextInput style={styles.inputSmall} placeholder="Crowd Status (e.g. Packed)" placeholderTextColor="#888" value={crowd} onChangeText={setCrowd} />
                    <TextInput style={styles.inputSmall} placeholder="Food Status (e.g. Samosas out)" placeholderTextColor="#888" value={food} onChangeText={setFood} />
                    <TouchableOpacity style={globalStyles.button} onPress={createInsight}>
                        <Text style={globalStyles.buttonText}>Drop Insight</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[globalStyles.title, { fontSize: 20, marginTop: 24, marginBottom: 8 }]}>Live Campus Updates</Text>
                <FlatList
                    data={insights}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={({ item: r }: any) => (
                        <View style={[globalStyles.glassPanel, { marginBottom: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: COLORS.cyan }]}>
                            <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 18 }}>{r.location_name}</Text>
                            <Text style={{ color: '#ccc', marginTop: 4 }}>👥 {r.crowd_status}</Text>
                            <Text style={{ color: '#ccc', marginTop: 2 }}>🍽 {r.food_status}</Text>
                            <Text style={{ color: '#555', fontSize: 10, marginTop: 8 }}>{new Date(r.timestamp).toLocaleTimeString()}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{ color: '#888' }}>No recent insights.</Text>}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    inputSmall: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: COLORS.white,
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.glassBorder
    }
});
