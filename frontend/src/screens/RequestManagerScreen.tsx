import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Pressable, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';
import * as Location from 'expo-location';

export default function RequestManagerScreen() {
    const [requests, setRequests] = useState([]);
    const [dest, setDest] = useState('');
    const [item, setItem] = useState('');
    const [desc, setDesc] = useState('');
    const [lat, setLat] = useState<string | null>(null);
    const [lng, setLng] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [locationMsg, setLocationMsg] = useState('Fetching live location...');
    
    // Deadline state
    const [useDeadline, setUseDeadline] = useState(false);
    const [deadline, setDeadline] = useState(new Date(Date.now() + 60 * 60 * 1000));
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationMsg('Permission denied. Using default location.');
                setLat('8.5241');
                setLng('76.9366');
                return;
            }
            try {
                let location = await Location.getCurrentPositionAsync({});
                setLat(location.coords.latitude.toFixed(6));
                setLng(location.coords.longitude.toFixed(6));
                setLocationMsg(`📍 Live Location Active (${location.coords.latitude.toFixed(2)}, ${location.coords.longitude.toFixed(2)})`);
            } catch (error) {
                setLocationMsg('Failed to fetch. Using default location.');
                setLat('8.5241');
                setLng('76.9366');
            }
        })();
    }, []);

    useEffect(() => {
        if (lat && lng) {
            fetchNearby();
        }
    }, [lat, lng]);

    const fetchNearby = async () => {
        if (!lat || !lng) return;
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await axios.get(`${API_URL}/requests/?lat=${lat}&lng=${lng}&radius=10.0`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (error) {
            console.log('Error fetching requests', error);
        }
    };

    const createRequest = async () => {
        if (!dest || !item) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        setSuccessMsg('');
        try {
            const token = await AsyncStorage.getItem('access_token');
            await axios.post(`${API_URL}/requests/`, {
                destination: dest,
                item_or_service: item,
                description: desc || '',
                latitude: lat,
                longitude: lng,
                time: new Date().toISOString(),
                deadline: useDeadline ? deadline.toISOString() : null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMsg('Request successfully posted!');
            setDest('');
            setItem('');
            setDesc('');
            fetchNearby();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error: any) {
            console.log('Error creating request', error.response?.data || error);
            Alert.alert('Error', 'Could not create request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, padding: 16 }}>
                <Text style={[globalStyles.title, { fontSize: 24, marginBottom: 16, color: COLORS.lightText }]}>Post a TagAlong Request</Text>

                <View style={[{ backgroundColor: COLORS.lightCard, borderRadius: 16, padding: 16, marginBottom: 16 }, globalStyles.cardShadow]}>
                    {successMsg ? <Text style={{ color: COLORS.success, marginBottom: 10, textAlign: 'center', fontWeight: 'bold' }}>{successMsg}</Text> : null}
                    <TextInput style={styles.inputSmall} placeholder="Destination (e.g., Tech Park)" placeholderTextColor="#888" value={dest} onChangeText={setDest} />
                    <TextInput style={styles.inputSmall} placeholder="Needed/Offered (e.g., Ride sharing)" placeholderTextColor="#888" value={item} onChangeText={setItem} />
                    <TextInput style={[styles.inputSmall, { height: 60, textAlignVertical: 'top' }]} placeholder="Description (Optional)" placeholderTextColor="#888" multiline value={desc} onChangeText={setDesc} />
                    <View style={{ marginBottom: 12, padding: 10, borderRadius: 8, backgroundColor: COLORS.lightBackground, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' }}>
                        <Text style={{ color: COLORS.indigo, fontSize: 13, fontWeight: 'bold' }}>{locationMsg}</Text>
                    </View>

                    {/* Deadline Section */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
                        <Text style={{ color: COLORS.lightText, fontWeight: 'bold' }}>Set Deadline?</Text>
                        <Switch 
                            value={useDeadline} 
                            onValueChange={setUseDeadline} 
                            trackColor={{ false: '#767577', true: COLORS.indigo }}
                        />
                    </View>

                    {useDeadline && (
                        <TouchableOpacity 
                            onPress={() => setShowPicker(true)}
                            style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: COLORS.lightBackground, borderWidth: 1, borderColor: '#E2E8F0' }}
                        >
                            <Text style={{ color: COLORS.lightText }}>Deadline: {deadline.toLocaleString()}</Text>
                        </TouchableOpacity>
                    )}

                    {showPicker && (
                        <DateTimePicker
                            value={deadline}
                            mode={pickerMode}
                            display="default"
                            minimumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                setShowPicker(false);
                                if (selectedDate) {
                                    setDeadline(selectedDate);
                                    if (pickerMode === 'date') {
                                        setPickerMode('time');
                                        setTimeout(() => setShowPicker(true), 100);
                                    } else {
                                        setPickerMode('date');
                                    }
                                }
                            }}
                        />
                    )}
                    <Pressable 
                        style={({ pressed }) => [
                            globalStyles.button, 
                            (!lat || !lng || isSubmitting) && { opacity: 0.7 },
                            pressed && !(!lat || !lng || isSubmitting) && { backgroundColor: COLORS.royalBlue }
                        ]} 
                        onPress={createRequest} 
                        disabled={!lat || !lng || isSubmitting}
                        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                    >
                        <Text style={globalStyles.buttonText}>{isSubmitting ? 'Posting...' : (!lat || !lng ? 'Waiting for Location...' : 'Post Request')}</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    inputSmall: {
        backgroundColor: COLORS.lightBackground,
        color: COLORS.lightText,
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    }
});
