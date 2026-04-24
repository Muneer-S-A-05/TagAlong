import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';

import { API_URL } from '../utils/config';

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = async () => {
        setError('');
        setSuccess('');

        if (!fullName.trim() || !phoneNumber.trim()) {
            setError('Full Name and Phone Number are required.');
            return;
        }

        if (phoneNumber.trim().length !== 10) {
            setError('Phone number must be exactly 10 digits.');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/register/`, { 
                email: email.trim(), 
                password, 
                full_name: fullName.trim(), 
                phone_number: phoneNumber.trim() 
            });
            if (res.status === 201) {
                setSuccess('Registration successful! You can now login.');
                setTimeout(() => navigation.navigate('Login'), 2000);
            }
        } catch (err: any) {
            if (err.response && err.response.data) {
                // Handle Django DRF validation error array
                const errorMsg = err.response.data.email ? err.response.data.email[0] : 'Registration failed';
                setError(errorMsg);
            } else {
                setError('Connection to backend failed.');
            }
        }
    };

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[globalStyles.lightContainer, { justifyContent: 'center', padding: 16 }]}>

                <View style={styles.lightCard}>
                    <Text style={[globalStyles.title, { textAlign: 'center', color: COLORS.indigo, fontSize: 24 }]}>Register</Text>
                    <Text style={{ textAlign: 'center', color: COLORS.lightSubtext, marginBottom: 24 }}>Join the TagAlong Campus Network</Text>

                    {error ? <Text style={{ color: COLORS.error, marginBottom: 12, textAlign: 'center' }}>{error}</Text> : null}
                    {success ? <Text style={{ color: COLORS.success, marginBottom: 12, textAlign: 'center', fontWeight: 'bold' }}>{success}</Text> : null}

                    <TextInput
                        style={styles.inputLight}
                        placeholder="Full Name (e.g. John Doe)"
                        placeholderTextColor="#94a3b8"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <TextInput
                        style={styles.inputLight}
                        placeholder="Phone Number (starting with 9)"
                        placeholderTextColor="#94a3b8"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
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

                    <TouchableOpacity style={[globalStyles.button, { backgroundColor: COLORS.indigo, marginTop: 8 }]} onPress={handleRegister}>
                        <Text style={globalStyles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignSelf: 'center', marginTop: 16 }}>
                        <Text style={{ color: COLORS.royalBlue, fontSize: 13, fontWeight: 'bold' }}>Already have an account? Login</Text>
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
