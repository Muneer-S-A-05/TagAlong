import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';

export default function MarketplaceScreen() {
    const navigation = useNavigation<any>();
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchItems();
        }, [])
    );

    const fetchItems = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await axios.get(`${API_URL}/marketplace/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(res.data);
        } catch (error) {
            console.log('Error fetching marketplace', error);
        }
    };

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
        }
    };

    const createListing = async () => {
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

            if (imageUri) {
                let filename = imageUri.split('/').pop() || 'upload.jpg';
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;
                formData.append('image', { uri: imageUri, name: filename, type } as any);
            }

            await axios.post(`${API_URL}/marketplace/`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            Alert.alert('Success', 'Listing added!');
            setName('');
            setPrice('');
            setDesc('');
            setImageUri(null);
            fetchItems();
        } catch (error: any) {
            console.log('Error creating marketplace item', error.response?.data || error);
            Alert.alert('Error', 'Could not create listing');
        }
    };

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, padding: 16 }}>
                <Text style={[globalStyles.title, { fontSize: 24, marginBottom: 16, color: COLORS.lightText }]}>P2P Marketplace</Text>

                <View style={[{ backgroundColor: COLORS.lightCard, borderRadius: 16, padding: 16, marginBottom: 16 }, globalStyles.cardShadow]}>
                    <TextInput style={styles.inputSmall} placeholder="Item Name" placeholderTextColor="#888" value={name} onChangeText={setName} />
                    <TextInput style={styles.inputSmall} placeholder="Asking Price" placeholderTextColor="#888" value={price} onChangeText={setPrice} keyboardType="numeric" />
                    <TextInput style={styles.inputSmall} placeholder="Description" placeholderTextColor="#888" value={desc} onChangeText={setDesc} />
                    
                    <TouchableOpacity style={[styles.inputSmall, { alignItems: 'center', backgroundColor: '#E2E8F0', borderWidth: 0 }]} onPress={pickImage}>
                        <Text style={{ color: COLORS.royalBlue, fontWeight: 'bold' }}>{imageUri ? 'Change Photo' : 'Upload Item Photo'}</Text>
                    </TouchableOpacity>
                    
                    {imageUri && (
                        <Image source={{ uri: imageUri }} style={{ width: '100%', height: 120, borderRadius: 8, marginBottom: 12 }} resizeMode="cover" />
                    )}

                    <Pressable 
                        style={({ pressed }) => [
                            globalStyles.button,
                            pressed && { backgroundColor: COLORS.royalBlue }
                        ]} 
                        onPress={createListing}
                        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                    >
                        <Text style={globalStyles.buttonText}>Add to Market</Text>
                    </Pressable>
                </View>

                <Text style={[globalStyles.title, { fontSize: 20, marginTop: 24, marginBottom: 8, color: COLORS.lightText }]}>Recent Listings</Text>
                <FlatList
                    data={items}
                    keyExtractor={(item: any) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    renderItem={({ item: r }: any) => (
                        <TouchableOpacity style={[{ backgroundColor: COLORS.lightCard, marginBottom: 12, padding: 16, width: '48%', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }, globalStyles.cardShadow]} onPress={() => navigation.navigate('MarketplaceDetail', { item: r })}>
                            {r.image ? (
                                <Image source={{ uri: r.image }} style={{ width: '100%', height: 100, borderRadius: 8, marginBottom: 12 }} resizeMode="cover" />
                            ) : (
                                <View style={{ width: '100%', height: 100, backgroundColor: '#E2E8F0', borderRadius: 8, marginBottom: 12, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#888', fontSize: 12 }}>No Image</Text>
                                </View>
                            )}
                            <Text style={{ color: COLORS.royalBlue, fontWeight: 'bold', fontSize: 16 }} numberOfLines={1}>{r.item_name}</Text>
                            <Text style={{ color: COLORS.indigo, fontWeight: 'bold', marginTop: 4 }}>₹{r.asking_price}</Text>
                            <Text style={{ color: COLORS.lightSubtext, fontSize: 12, marginTop: 4 }} numberOfLines={2}>{r.description}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={{ color: '#888' }}>Marketplace is empty.</Text>}
                />
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
