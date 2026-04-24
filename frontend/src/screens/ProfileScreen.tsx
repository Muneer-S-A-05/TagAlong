import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const [profileData, setProfileData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await axios.get(`${API_URL}/profile/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(res.data);
        } catch (error: any) {
            console.log('Error fetching profile data:', error.response?.data || error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile();
        setRefreshing(false);
    };

    if (!profileData) {
        return (
            <SafeAreaView style={globalStyles.lightContainer}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: COLORS.lightSubtext }}>Loading Profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Profile Header Block */}
                <View style={[styles.headerCard, globalStyles.cardShadow]}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>{profileData.user.email.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.userName}>{profileData.user.full_name || profileData.user.email.split('@')[0]}</Text>
                    <Text style={styles.userEmail}>{profileData.user.email}</Text>
                    <Text style={[styles.userEmail, { marginTop: 4, letterSpacing: 1 }]}>{profileData.user.phone_number}</Text>
                    
                    <TouchableOpacity 
                        style={styles.editBtn} 
                        onPress={() => navigation.navigate('EditProfile', { user: profileData.user })}
                    >
                        <Text style={styles.editBtnText}>Edit Profile</Text>
                    </TouchableOpacity>

                    {profileData.user.is_staff && (
                        <TouchableOpacity 
                            style={[styles.editBtn, { backgroundColor: COLORS.urgentOrange, borderColor: COLORS.urgentOrange, marginTop: 12 }]} 
                            onPress={() => navigation.navigate('AdminDashboard')}
                        >
                            <Text style={styles.editBtnText}>Admin Dashboard</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* My Requests Section */}
                <Text style={styles.sectionTitle}>My TagAlong Requests</Text>
                {profileData.requests.length === 0 ? (
                    <Text style={styles.emptyText}>You haven't posted any help requests yet.</Text>
                ) : (
                    profileData.requests.map((r: any) => (
                        <TouchableOpacity key={r.id} style={[styles.listItem, globalStyles.cardShadow]} onPress={() => navigation.navigate('RequestDetail', { request: r })}>
                            <View style={styles.listContent}>
                                <Text style={styles.listTitle}>{r.item_or_service}</Text>
                                <Text style={styles.listSubtext}>{r.destination}</Text>
                            </View>
                            <View style={[styles.statusPill, { backgroundColor: r.status === 'Pending' ? COLORS.indigo : COLORS.success }]}>
                                <Text style={styles.statusText}>{r.status}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* My Matched Requests Section */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>My Matched Requests</Text>
                {(!profileData.matched_requests || profileData.matched_requests.length === 0) ? (
                    <Text style={styles.emptyText}>You haven't matched any requests yet.</Text>
                ) : (
                    profileData.matched_requests.map((r: any) => (
                        <TouchableOpacity key={r.id} style={[styles.listItem, globalStyles.cardShadow]} onPress={() => navigation.navigate('RequestDetail', { request: r })}>
                            <View style={styles.listContent}>
                                <Text style={styles.listTitle}>{r.item_or_service}</Text>
                                <Text style={styles.listSubtext}>{r.destination}</Text>
                            </View>
                            <View style={[styles.statusPill, { backgroundColor: COLORS.success }]}>
                                <Text style={styles.statusText}>{r.status}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* My Accepted Tasks Section */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>My Accepted Tasks</Text>
                {(!profileData.accepted_requests || profileData.accepted_requests.length === 0) ? (
                    <Text style={styles.emptyText}>You haven't accepted any tasks yet.</Text>
                ) : (
                    profileData.accepted_requests.map((r: any) => (
                        <TouchableOpacity key={r.id} style={[styles.listItem, globalStyles.cardShadow]} onPress={() => navigation.navigate('RequestDetail', { request: r })}>
                            <View style={styles.listContent}>
                                <Text style={styles.listTitle}>{r.item_or_service}</Text>
                                <Text style={styles.listSubtext}>{r.destination}</Text>
                            </View>
                            <View style={[styles.statusPill, { backgroundColor: r.status === 'Matched' ? COLORS.success : COLORS.urgentOrange }]}>
                                <Text style={styles.statusText}>{r.status === 'Matched' ? 'Matched' : 'Pending Match'}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* My Marketplace Items Section */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>My Marketplace Listings</Text>
                {profileData.listings.length === 0 ? (
                    <Text style={styles.emptyText}>You haven't listed any items for sale.</Text>
                ) : (
                    <FlatList
                        data={profileData.listings}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item: any) => item.id.toString()}
                        renderItem={({ item: m }: any) => (
                            <TouchableOpacity style={[styles.marketCard, globalStyles.cardShadow]} onPress={() => navigation.navigate('MarketplaceDetail', { item: { ...m, seller_email: profileData.user.email } })}>
                                {m.image ? (
                                    <Image source={{ uri: m.image }} style={{ width: '100%', height: 90, borderRadius: 8, marginBottom: 8 }} resizeMode="cover" />
                                ) : (
                                    <View style={{ width: '100%', height: 90, backgroundColor: '#E2E8F0', borderRadius: 8, marginBottom: 8, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#888', fontSize: 10 }}>No Image</Text>
                                    </View>
                                )}
                                <Text style={styles.marketTitle} numberOfLines={1}>{m.item_name}</Text>
                                <Text style={styles.marketPrice}>₹{m.asking_price}</Text>
                                <Text style={{ color: COLORS.lightSubtext, fontSize: 10, marginTop: 4 }} numberOfLines={1}>{profileData.user.email}</Text>
                            </TouchableOpacity>
                        )}
                        scrollEnabled={true}
                    />
                )}

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    headerCard: {
        backgroundColor: COLORS.royalBlue,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 8,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.lightBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarLargeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.royalBlue,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#E2E8F0',
    },
    editBtn: {
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    editBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.lightText,
        marginBottom: 16,
    },
    listItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    listContent: {
        flex: 1,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.royalBlue,
    },
    listSubtext: {
        fontSize: 13,
        color: COLORS.lightSubtext,
        marginTop: 4,
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyText: {
        color: COLORS.lightSubtext,
        fontStyle: 'italic',
    },
    marketCard: {
        backgroundColor: COLORS.lightCard,
        padding: 12,
        borderRadius: 12,
        marginRight: 12,
        width: 150,
        height: 180,
        justifyContent: 'flex-start',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    marketTitle: {
        color: COLORS.lightText,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    marketPrice: {
        color: COLORS.indigo,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
