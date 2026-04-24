import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';

export default function MarketplaceEditScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { item } = route.params;

    const [name, setName] = useState(item.item_name || '');
    const [price, setPrice] = useState(item.asking_price?.toString() || '');
    const [desc, setDesc] = useState(item.description || '');
    const [imageUri, setImageUri] = useState<string | null>(item.image || null);
    const [isImageChanged, setIsImageChanged] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (result.status !== 'granted') {
            Alert.alert('Permission required', 'Allow camera roll access to list photos.');
            return;
        }
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
            setImageUri(pickerResult.assets[0].uri);
            setIsImageChanged(true);
        }
    };

    const updateListing = async () => {
        if (!name || !price || !desc) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        try {
            const token = await AsyncStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('item_name', name);
            formData.append('asking_price', price);
            formData.append('description', desc);

            if (isImageChanged && imageUri) {
                let filename = imageUri.split('/').pop() || 'upload.jpg';
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;
                formData.append('image', { uri: imageUri, name: filename, type } as any);
            }

            await axios.patch(`${API_URL}/marketplace/${item.id}/update/`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            Alert.alert('Success', 'Listing updated successfully!');
            navigation.navigate('Dashboard', { screen: 'Marketplace' });
        } catch (error: any) {
            console.log('Error updating marketplace item', error.response?.data || error);
            Alert.alert('Error', 'Could not update listing');
        }
    };

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>{'< Back'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Item</Text>
                <View style={{ width: 60 }} />
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, padding: 16 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    <View style={[{ backgroundColor: COLORS.lightCard, borderRadius: 16, padding: 16, marginBottom: 16 }, globalStyles.cardShadow]}>
                        <Text style={styles.label}>Item Name</Text>
                        <TextInput style={styles.inputSmall} value={name} onChangeText={setName} />
                        
                        <Text style={styles.label}>Asking Price (₹)</Text>
                        <TextInput style={styles.inputSmall} value={price} onChangeText={setPrice} keyboardType="numeric" />
                        
                        <Text style={styles.label}>Description</Text>
                        <TextInput style={[styles.inputSmall, { height: 80, textAlignVertical: 'top' }]} multiline value={desc} onChangeText={setDesc} />
                        
                        <TouchableOpacity style={[styles.inputSmall, { alignItems: 'center', backgroundColor: '#E2E8F0', borderWidth: 0 }]} onPress={pickImage}>
                            <Text style={{ color: COLORS.royalBlue, fontWeight: 'bold' }}>Change Photo</Text>
                        </TouchableOpacity>
                        
                        {imageUri && (
                            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180, borderRadius: 8, marginBottom: 16 }} resizeMode="cover" />
                        )}

                        <TouchableOpacity style={[globalStyles.button, { marginTop: 12 }]} onPress={updateListing}>
                            <Text style={globalStyles.buttonText}>Save Changes</Text>
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
    backButton: { width: 60 },
    backText: { color: COLORS.indigo, fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.lightText },
    inputSmall: {
        backgroundColor: COLORS.lightBackground,
        color: COLORS.lightText,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    label: {
        fontSize: 12,
        color: COLORS.lightSubtext,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    }
});
