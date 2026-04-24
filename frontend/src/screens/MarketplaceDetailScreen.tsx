import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Modal, ScrollView, Image, Alert } from 'react-native';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';
import * as Clipboard from 'expo-clipboard';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function MarketplaceDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const [itemData, setItemData] = useState(route.params?.item || null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                const res = await axios.get(`${API_URL}/profile/`, { headers: { Authorization: `Bearer ${token}` } });
                setCurrentUserId(res.data.user.id);
                setCurrentUserEmail(res.data.user.email);
            } catch (e) {
                console.log('Error fetching user context', e);
            }
        };
        fetchUserId();
    }, []);

    if (!itemData) {
        return (
            <SafeAreaView style={globalStyles.lightContainer}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: COLORS.lightSubtext }}>No listing data available.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isSeller = currentUserEmail === itemData.seller_email;

    const copyToClipboard = async () => {
        const phone = itemData.seller_phone || '+91 98765 43210';
        await Clipboard.setStringAsync(phone);
        Alert.alert('Copied!', 'Mobile number copied to clipboard.');
        setModalVisible(false);
    };

    const handleMarkSold = async () => {
        Alert.alert('Mark as Sold', 'Are you sure you want to remove this listing? This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('access_token');
                        await axios.delete(`${API_URL}/marketplace/${itemData.id}/close/`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        Alert.alert('Success', 'Item marked as sold and removed!');
                        navigation.goBack();
                    } catch (e: any) {
                        Alert.alert('Error', e.response?.data?.error || 'Could not close listing');
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>{'< Back'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Listing Details</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.container}>
                {itemData.image ? (
                    <Image source={{ uri: itemData.image }} style={styles.coverImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.coverImage, { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#888', fontWeight: 'bold' }}>No Image Provided</Text>
                    </View>
                )}

                <View style={[styles.detailCard, globalStyles.cardShadow]}>
                    <Text style={styles.titleText}>{itemData.item_name}</Text>
                    <Text style={styles.priceText}>₹{itemData.asking_price}</Text>

                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.descriptionText}>{itemData.description}</Text>

                    <Text style={styles.label}>Seller ID</Text>
                    <Text style={styles.value}>{itemData.seller_email}</Text>
                </View>

                {isSeller ? (
                    <View style={{ marginBottom: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={[globalStyles.button, { flex: 1, marginRight: 8, backgroundColor: COLORS.royalBlue, marginTop: 12 }]} onPress={() => navigation.navigate('MarketplaceEdit', { item: itemData })}>
                            <Text style={globalStyles.buttonText}>Edit Item</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[globalStyles.button, { flex: 1, marginLeft: 8, backgroundColor: COLORS.urgentOrange, marginTop: 12 }]} onPress={handleMarkSold}>
                            <Text style={globalStyles.buttonText}>Mark as Sold</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    currentUserId !== null && (
                        <View style={{ marginBottom: 40 }}>
                            <TouchableOpacity style={[globalStyles.button, { backgroundColor: COLORS.indigo, marginTop: 12 }]} onPress={() => setModalVisible(true)}>
                                <Text style={globalStyles.buttonText}>Contact Seller</Text>
                            </TouchableOpacity>
                        </View>
                    )
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Contact Seller</Text>
                        <Text style={styles.modalPhone}>{itemData.seller_phone || '+91 98765 43210'}</Text>
                        
                        <TouchableOpacity style={[globalStyles.button, { marginTop: 24 }]} onPress={copyToClipboard}>
                            <Text style={globalStyles.buttonText}>Copy Number</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[globalStyles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.lightSubtext, marginTop: 12 }]} onPress={() => setModalVisible(false)}>
                            <Text style={[globalStyles.buttonText, { color: COLORS.indigo }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    container: { flex: 1, padding: 16 },
    coverImage: {
        width: '100%',
        height: 250,
        borderRadius: 16,
        marginBottom: 20,
    },
    detailCard: {
        backgroundColor: COLORS.lightCard,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    titleText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.royalBlue,
        marginBottom: 8,
    },
    priceText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.indigo,
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        color: COLORS.lightSubtext,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 16,
        color: COLORS.lightText,
        lineHeight: 24,
        marginBottom: 20,
    },
    value: {
        fontSize: 18,
        color: COLORS.lightText,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.lightCard,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.lightText,
        marginBottom: 16,
    },
    modalPhone: {
        fontSize: 24,
        color: COLORS.royalBlue,
        fontWeight: 'bold',
        letterSpacing: 2,
    }
});
