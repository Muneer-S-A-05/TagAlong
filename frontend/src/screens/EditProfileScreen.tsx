import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';

export default function EditProfileScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { user } = route.params;

    const [fullName, setFullName] = useState(user.full_name || '');
    const [phoneNumber, setPhoneNumber] = useState(user.phone_number || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdateProfile = async () => {
        if (!fullName || !phoneNumber) {
            Alert.alert('Error', 'Full Name and Phone Number are required.');
            return;
        }

        if (phoneNumber.length !== 10) {
            Alert.alert('Error', 'Phone number must be exactly 10 digits.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            await axios.patch(`${API_URL}/users/${user.id}/`, {
                full_name: fullName,
                phone_number: phoneNumber
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.phone_number?.[0] || 'Could not update profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            Alert.alert('Error', 'Both current and new passwords are required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            await axios.post(`${API_URL}/users/${user.id}/change_password/`, {
                old_password: oldPassword,
                new_password: newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', 'Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
        } catch (error: any) {
            const msg = error.response?.status === 400 ? 'Current password incorrect.' : 'Could not change password.';
            Alert.alert('Error', msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>{'< Back'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.container}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    
                    {/* Public Info Section */}
                    <View style={[styles.section, globalStyles.cardShadow]}>
                        <Text style={styles.sectionLabel}>Public Information</Text>
                        
                        <Text style={styles.inputLabel}>Email ID (Immutable)</Text>
                        <View style={[styles.input, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                            <Text style={{ color: '#64748B' }}>{user.email}</Text>
                        </View>

                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Your Name"
                        />

                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="10-digit number"
                            keyboardType="phone-pad"
                            maxLength={10}
                        />

                        <TouchableOpacity 
                            style={[globalStyles.button, { backgroundColor: COLORS.indigo, marginTop: 12 }]} 
                            onPress={handleUpdateProfile}
                            disabled={isSubmitting}
                        >
                            <Text style={globalStyles.buttonText}>{isSubmitting ? 'Updating...' : 'Save Changes'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Security Section */}
                    <View style={[styles.section, globalStyles.cardShadow, { marginTop: 20 }]}>
                        <Text style={styles.sectionLabel}>Security & Password</Text>

                        <Text style={styles.inputLabel}>Current Password</Text>
                        <TextInput
                            style={styles.input}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            secureTextEntry
                            placeholder="Verify current password"
                        />

                        <Text style={styles.inputLabel}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            placeholder="Enter new password"
                        />

                        <TouchableOpacity 
                            style={[globalStyles.button, { backgroundColor: COLORS.urgentOrange, marginTop: 12 }]} 
                            onPress={handleChangePassword}
                            disabled={isSubmitting}
                        >
                            <Text style={globalStyles.buttonText}>Update Password</Text>
                        </TouchableOpacity>
                    </View>

                </KeyboardAvoidingView>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: COLORS.lightBackground,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        width: 60,
    },
    backText: {
        color: COLORS.indigo,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.lightText,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    section: {
        backgroundColor: COLORS.lightCard,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.royalBlue,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        color: COLORS.lightSubtext,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.lightBackground,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        color: COLORS.lightText,
        marginBottom: 20,
        fontSize: 16,
        minHeight: 48,
        justifyContent: 'center'
    }
});
