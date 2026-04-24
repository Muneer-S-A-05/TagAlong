import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, COLORS } from '../utils/styles';
import { API_URL } from '../utils/config';

export default function AdminDashboardScreen() {
    const navigation = useNavigation<any>();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAllRequests = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await axios.get(`${API_URL}/admin/requests/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (error: any) {
            console.log('Admin Fetch Error:', error.response?.data || error);
            Alert.alert('Error', 'Failed to fetch requests for administration.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllRequests();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllRequests();
    };

    const handleRemoveRequest = (requestId: number) => {
        Alert.alert(
            'Remove Request',
            'Are you sure you want to remove this request as fake/spam? This will permanently delete it.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('access_token');
                            await axios.delete(`${API_URL}/admin/requests/${requestId}/delete/`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            // Real-time update: filtered out from local state
                            setRequests(requests.filter(r => r.id !== requestId));
                            Alert.alert('Success', 'Request has been permanently removed.');
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.error || 'Could not delete request');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.requestCard, globalStyles.cardShadow]}>
            <View style={styles.cardHeader}>
                <View style={styles.requesterInfo}>
                    <Text style={styles.requesterName}>{item.requester_full_name || 'Student'}</Text>
                    <Text style={styles.requesterPhone}>{item.requester_phone || 'No Phone'}</Text>
                    <Text style={styles.requesterEmail}>{item.requester_email}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleRemoveRequest(item.id)}
                >
                    <MaterialCommunityIcons name="trash-can-outline" size={24} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.requestBody}>
                <Text style={styles.itemTitle}>{item.item_or_service}</Text>
                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.lightSubtext} />
                    <Text style={styles.infoText}>{item.destination}</Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.lightSubtext} />
                    <Text style={styles.infoText}>{new Date(item.time).toLocaleString()}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: item.status === 'Matched' ? COLORS.success : COLORS.royalBlue }]} />
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            
            <TouchableOpacity 
                style={styles.viewDetailBtn}
                onPress={() => navigation.navigate('RequestDetail', { request: item })}
            >
                <Text style={styles.viewDetailText}>View Details</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.indigo} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Moderation</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.indigo} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.indigo} />
                    }
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Text style={styles.emptyText}>No active or matched requests to moderate.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: COLORS.lightBackground,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.lightText,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    requestCard: {
        backgroundColor: COLORS.lightCard,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    requesterInfo: {
        flex: 1,
    },
    requesterName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.royalBlue,
    },
    requesterPhone: {
        fontSize: 14,
        color: COLORS.urgentOrange,
        fontWeight: 'bold',
        marginTop: 2,
    },
    requesterEmail: {
        fontSize: 12,
        color: COLORS.lightSubtext,
        marginTop: 2,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 12,
    },
    requestBody: {
        marginBottom: 12,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.lightText,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.lightSubtext,
        marginLeft: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: '#F1F5F9',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.lightSubtext,
    },
    viewDetailBtn: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    viewDetailText: {
        color: COLORS.indigo,
        fontWeight: 'bold',
        fontSize: 14,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: COLORS.lightSubtext,
        fontStyle: 'italic',
        fontSize: 16,
    }
});
