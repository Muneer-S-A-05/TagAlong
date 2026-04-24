import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';

import { API_URL } from '../utils/config';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!email.endsWith('@cet.ac.in')) {
            setError('Only @cet.ac.in emails are allowed.');
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/login/`, { email, password });
            await AsyncStorage.setItem('access_token', res.data.access);
            await AsyncStorage.setItem('refresh_token', res.data.refresh);
            navigation.replace('Dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid credentials or connection failed.');
        }
    };

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[globalStyles.lightContainer, { justifyContent: 'center', padding: 16 }]}>

                <View style={styles.lightCard}>
                    <Text style={[globalStyles.title, { textAlign: 'center', color: COLORS.indigo, fontSize: 28 }]}>TagAlong</Text>
                    <Text style={{ textAlign: 'center', color: COLORS.lightSubtext, marginBottom: 24 }}>Campus Request & Marketplace Network</Text>

                    {error ? <Text style={{ color: COLORS.error, marginBottom: 12, textAlign: 'center' }}>{error}</Text> : null}

                    <TextInput
                        style={styles.inputLight}
                        placeholder="Student Email (@cet.ac.in)"
                        placeholderTextColor="#94a3b8"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.inputLight}
                        placeholder="Password"
                        placeholderTextColor="#94a3b8"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={[globalStyles.button, { backgroundColor: COLORS.indigo, marginTop: 8 }]} onPress={handleLogin}>
                        <Text style={globalStyles.buttonText}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[globalStyles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.urgentOrange, marginTop: 12 }]} 
                        onPress={() => { setEmail('admin@cet.ac.in'); setPassword('admin123'); setTimeout(handleLogin, 100); }}
                    >
                        <Text style={[globalStyles.buttonText, { color: COLORS.urgentOrange }]}>Login as Admin (Staff)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ alignSelf: 'center', marginTop: 16 }}>
                        <Text style={{ color: COLORS.royalBlue, fontSize: 13, fontWeight: 'bold' }}>Don't have an account? Register</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    lightCard: {
        backgroundColor: COLORS.lightCard,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    inputLight: {
        backgroundColor: COLORS.lightBackground,
        color: COLORS.lightText,
        padding: 14,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontSize: 15
    }
});
