import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';

export default function RequestEditScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const request = route.params?.request;

    const [dest, setDest] = useState(request?.destination || '');
    const [item, setItem] = useState(request?.item_or_service || '');
    const [desc, setDesc] = useState(request?.description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Deadline state
    const [useDeadline, setUseDeadline] = useState(!!request?.deadline);
    const [deadline, setDeadline] = useState(request?.deadline ? new Date(request.deadline) : new Date(Date.now() + 60 * 60 * 1000));
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const handleSave = async () => {
        if (!dest || !item) {
            Alert.alert('Error', 'Destination and Item/Service are required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            await axios.patch(`${API_URL}/requests/${request.id}/update/`, {
                destination: dest,
                item_or_service: item,
                description: desc,
                deadline: useDeadline ? deadline.toISOString() : null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', 'Request updated successfully!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Could not update request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>{'< Cancel'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Request</Text>
                <View style={{ width: 60 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={[styles.card, globalStyles.cardShadow]}>
                        <Text style={styles.label}>Destination</Text>
                        <TextInput 
                            style={styles.input} 
                            value={dest} 
                            onChangeText={setDest} 
                            placeholder="e.g. Tech Park"
                        />

                        <Text style={styles.label}>Item / Service</Text>
                        <TextInput 
                            style={styles.input} 
                            value={item} 
                            onChangeText={setItem} 
                            placeholder="e.g. Need a ride"
                        />

                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput 
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                            value={desc} 
                            onChangeText={setDesc} 
                            multiline 
                            placeholder="Add more details..."
                        />

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
                                onPress={() => { setPickerMode('date'); setShowPicker(true); }}
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
                                        }
                                    }
                                }}
                            />
                        )}

                        <TouchableOpacity 
                            style={[globalStyles.button, { backgroundColor: COLORS.indigo, marginTop: 24 }]} 
                            onPress={handleSave}
                            disabled={isSubmitting}
                        >
                            <Text style={globalStyles.buttonText}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    backButton: { width: 80 },
    backText: { color: COLORS.indigo, fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.lightText },
    container: { padding: 16 },
    card: {
        backgroundColor: COLORS.lightCard,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    label: {
        fontSize: 12,
        color: COLORS.lightSubtext,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.lightBackground,
        color: COLORS.lightText,
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    }
});
