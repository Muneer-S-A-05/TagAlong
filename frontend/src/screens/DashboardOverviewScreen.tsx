import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';

export default function DashboardOverviewScreen() {
    const navigation = useNavigation<any>();
    const [requestCount, setRequestCount] = useState(0);
    const [marketCount, setMarketCount] = useState(0);
    const [insightCount, setInsightCount] = useState(0);
    const [urgentRequests, setUrgentRequests] = useState([]);
    const [marketplaceItems, setMarketplaceItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good Morning!';
        if (hour >= 12 && hour < 17) return 'Good Afternoon!';
        if (hour >= 17 && hour < 21) return 'Good Evening!';
        return 'Good Night!';
    };

    const fetchData = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const headers = { Authorization: `Bearer ${token}` };

            const reqRes = await axios.get(`${API_URL}/requests/`, { headers });
            const marketRes = await axios.get(`${API_URL}/marketplace/`, { headers });

            setRequestCount(reqRes.data.length || 0);
            setMarketCount(marketRes.data.length || 0);

            setUrgentRequests(reqRes.data.slice(0, 5));
            setMarketplaceItems(marketRes.data.slice(0, 5));
        } catch (error: any) {
            console.log('Error fetching dashboard data:', error.response?.data || error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const navigateTo = (screen: string, params?: any) => {
        navigation.navigate(screen, params);
    };

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Campus Dashboard</Text>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                </View>

                {/* Trio Grid */}
                <View style={styles.gridContainer}>
                    <TouchableOpacity style={[styles.card, globalStyles.cardShadow]} onPress={() => navigateTo('Requests')}>
                        <Text style={styles.cardValue}>{requestCount}</Text>
                        <Text style={styles.cardTitle}>Help Requests</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.card, globalStyles.cardShadow]} onPress={() => navigation.navigate('Marketplace')}>
                        <Text style={styles.cardValue}>{marketCount}</Text>
                        <Text style={styles.cardTitle}>Marketplace</Text>
                    </TouchableOpacity>
                </View>

                {/* Active Requests List */}
                <Text style={styles.sectionTitle}>Active Requests</Text>
                {urgentRequests.length === 0 ? (
                    <Text style={styles.emptyText}>No active requests right now.</Text>
                ) : (
                    urgentRequests.map((r: any) => {
                        const isUrgent = r.deadline ? (new Date(r.deadline).getTime() - new Date().getTime() > 0 && new Date(r.deadline).getTime() - new Date().getTime() < 4 * 60 * 60 * 1000) : false;
                        return (
                            <TouchableOpacity key={r.id} style={[styles.listItem, globalStyles.cardShadow]} onPress={() => navigateTo('RequestDetail', { request: r })}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{r.requester_email ? r.requester_email.charAt(0).toUpperCase() : 'U'}</Text>
                                </View>
                                <View style={styles.listContent}>
                                    <Text style={styles.listTitle}>{r.item_or_service}</Text>
                                    <Text style={styles.listSubtext}>
                                        {r.destination} • {r.deadline ? new Date(r.deadline).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'No Deadline'}
                                    </Text>
                                </View>
                                {isUrgent && (
                                    <View style={styles.urgentPill}>
                                        <Text style={styles.urgentText}>URGENT</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}

                {/* Marketplace Discoveries List */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Marketplace Discoveries</Text>
                {marketplaceItems.length === 0 ? (
                    <Text style={styles.emptyText}>Nothing in the marketplace right now.</Text>
                ) : (
                    <FlatList
                        data={marketplaceItems.slice(0, 4)}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item: any) => item.id.toString()}
                        renderItem={({ item: m }: any) => (
                            <TouchableOpacity style={[styles.marketCard, globalStyles.cardShadow]} onPress={() => navigateTo('MarketplaceDetail', { item: m })}>
                                {m.image ? (
                                    <Image source={{ uri: m.image }} style={styles.marketThumbnail} resizeMode="cover" />
                                ) : (
                                    <View style={[styles.marketThumbnail, { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={{ color: '#888', fontSize: 10 }}>No Image</Text>
                                    </View>
                                )}
                                <Text style={styles.marketTitle} numberOfLines={1}>{m.item_name}</Text>
                                <Text style={styles.marketPrice}>₹{m.asking_price}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={[styles.fab, globalStyles.cardShadow]} onPress={() => navigateTo('Requests')}>
                <Text style={styles.fabText}>+ Request Urgent Help</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 24,
        marginTop: 8,
    },
    headerTitle: {
        fontSize: 16,
        color: COLORS.lightSubtext,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.lightText,
        marginTop: 4,
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    card: {
        backgroundColor: COLORS.lightCard,
        borderRadius: 16,
        padding: 16,
        width: '48%',
        alignItems: 'center',
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.royalBlue,
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 12,
        color: COLORS.lightText,
        textAlign: 'center',
        fontWeight: '600',
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
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.lightBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.lightSubtext,
    },
    listContent: {
        flex: 1,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.lightText,
    },
    listSubtext: {
        fontSize: 13,
        color: COLORS.lightSubtext,
        marginTop: 4,
    },
    urgentPill: {
        backgroundColor: COLORS.urgentOrange,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    urgentText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyText: {
        color: COLORS.lightSubtext,
        fontStyle: 'italic',
    },
    marketCard: {
        backgroundColor: COLORS.royalBlue,
        padding: 12,
        borderRadius: 12,
        marginRight: 16,
        width: 140,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    marketThumbnail: {
        width: '100%',
        height: 80,
        borderRadius: 8,
        marginBottom: 8,
    },
    marketTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    marketPrice: {
        color: '#E2E8F0',
        fontSize: 12,
    },
    marketButton: {
        backgroundColor: COLORS.white,
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: 'center',
    },
    marketButtonText: {
        color: COLORS.royalBlue,
        fontSize: 12,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: COLORS.indigo,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    fabText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
