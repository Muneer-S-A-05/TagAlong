import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Modal, Alert, ScrollView } from 'react-native';
import { globalStyles, COLORS } from '../utils/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function RequestDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const [requestData, setRequestData] = useState(route.params?.request || null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('Contact');
    const [modalPhone, setModalPhone] = useState('');
    const [applicantModalVisible, setApplicantModalVisible] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                const res = await axios.get(`${API_URL}/profile/`, { headers: { Authorization: `Bearer ${token}` } });
                setCurrentUserId(res.data.user.id);
            } catch (e) {
                console.log('Error fetching user ID', e);
            }
        };
        fetchUserId();
    }, []);

    if (!requestData) {
        return (
            <SafeAreaView style={globalStyles.lightContainer}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: COLORS.lightSubtext }}>No request data available.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isCreator = currentUserId === requestData.requester;
    const hasApplied = requestData.applicants_list?.some((a: any) => a.id === currentUserId);

    const handleContact = (phone: string, title: string) => {
        setModalPhone(phone || '+91 98765 43210');
        setModalTitle(title);
        setModalVisible(true);
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(modalPhone);
        Alert.alert('Copied!', 'Mobile number copied to clipboard.');
        setModalVisible(false);
    };

    const handleApply = async () => {
        try {
            let lat: string | null = null;
            let lng: string | null = null;
            
            // Try explicit GPS mapping
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                try {
                    let location = await Location.getCurrentPositionAsync({});
                    lat = location.coords.latitude.toFixed(6);
                    lng = location.coords.longitude.toFixed(6);
                } catch (e) {
                    lat = '8.524100';
                    lng = '76.936600';
                }
            } else {
                lat = '8.524100';
                lng = '76.936600';
            }

            const token = await AsyncStorage.getItem('access_token');
            const res = await axios.post(`${API_URL}/requests/${requestData.id}/accept/`, {
                latitude: lat,
                longitude: lng
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequestData(res.data);
            Alert.alert('Success', 'You have applied to help with this request!');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Could not apply for request');
        }
    };

    const handleSelectHelper = async (helperId: number) => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await axios.post(`${API_URL}/requests/${requestData.id}/select_helper/`, { helper_id: helperId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequestData(res.data);
            Alert.alert('Success', 'Helper selected successfully!');
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.error || 'Could not select helper');
        }
    };

    const handleCancelAccept = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await axios.post(`${API_URL}/requests/${requestData.id}/cancel_accept/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequestData(res.data);
            Alert.alert('Success', 'You have cancelled your application for this request.');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Could not cancel application');
        }
    };

    const handleCloseRequest = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            await axios.delete(`${API_URL}/requests/${requestData.id}/close/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Closed', 'Request removed successfully');
            navigation.goBack();
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.error || 'Could not close request');
        }
    };

    return (
        <SafeAreaView style={globalStyles.lightContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>{'< Back'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request Details</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.container}>
                <View style={[styles.detailCard, globalStyles.cardShadow]}>
                    <Text style={styles.label}>Requester</Text>
                    <Text style={styles.value}>{requestData.requester_email}</Text>

                    <Text style={styles.label}>Item / Service</Text>
                    <Text style={styles.value}>{requestData.item_or_service}</Text>

                    <Text style={styles.label}>Destination</Text>
                    <Text style={styles.value}>{requestData.destination}</Text>

                    <Text style={styles.label}>Time Window</Text>
                    <Text style={styles.value}>{new Date(requestData.time).toLocaleString()}</Text>

                    <Text style={styles.label}>Status</Text>
                    <Text style={[styles.value, { color: requestData.status === 'Matched' ? COLORS.success : COLORS.royalBlue }]}>
                        {requestData.status}
                    </Text>

                    <Text style={styles.label}>Description</Text>
                    {requestData.description ? (
                        <Text style={styles.value}>{requestData.description}</Text>
                    ) : (
                        <Text style={[styles.value, { fontStyle: 'italic', color: COLORS.lightSubtext }]}>No additional details provided</Text>
                    )}

                    <Text style={styles.label}>Deadline</Text>
                    <Text style={[styles.value, { color: requestData.deadline ? COLORS.urgentOrange : COLORS.lightSubtext }]}>
                        {requestData.deadline ? new Date(requestData.deadline).toLocaleString() : 'No Deadline'}
                    </Text>
                </View>

                {/* CREATOR VIEW */}
                {isCreator && (
                    <View style={{ marginBottom: 40 }}>
                        <Text style={[globalStyles.title, { fontSize: 20, marginBottom: 16, color: COLORS.lightText }]}>Applicants</Text>
                        
                        {requestData.status === 'Matched' ? (
                            <View style={[styles.applicantCard, globalStyles.cardShadow, { borderColor: COLORS.success, borderWidth: 2 }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.applicantName}>Matched with ID: {requestData.matched_user_email}</Text>
                                </View>
                                <TouchableOpacity style={[styles.selectBtn, { backgroundColor: COLORS.indigo }]} onPress={() => handleContact(requestData.matched_user_phone, 'Contact Applicant')}>
                                    <Text style={styles.selectBtnText}>Contact</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            requestData.applicants_list && requestData.applicants_list.length > 0 ? (
                                requestData.applicants_list.map((applicant: any) => (
                                    <View key={applicant.id} style={[styles.applicantCard, globalStyles.cardShadow]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.applicantName}>{applicant.email}</Text>
                                        </View>
                                        <TouchableOpacity style={[styles.selectBtn, { backgroundColor: COLORS.royalBlue }]} onPress={() => { setSelectedApplicant(applicant); setApplicantModalVisible(true); }}>
                                            <Text style={styles.selectBtnText}>View</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <Text style={{ color: COLORS.lightSubtext, fontStyle: 'italic', marginBottom: 20 }}>No one has applied yet.</Text>
                            )
                        )}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
                            {requestData.status !== 'Matched' ? (
                                <TouchableOpacity style={[globalStyles.button, { flex: 1, backgroundColor: COLORS.royalBlue, marginRight: 8 }]} onPress={() => navigation.navigate('RequestEdit', { request: requestData })}>
                                    <Text style={globalStyles.buttonText}>Edit Request</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={[globalStyles.button, { flex: 1, backgroundColor: '#E2E8F0', marginRight: 8, opacity: 0.6 }]}>
                                    <Text style={[globalStyles.buttonText, { color: '#888' }]}>Locked (Matched)</Text>
                                </View>
                            )}
                            <TouchableOpacity style={[globalStyles.button, { flex: 1, backgroundColor: COLORS.urgentOrange, marginLeft: 8 }]} onPress={handleCloseRequest}>
                                <Text style={globalStyles.buttonText}>Close Request</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* HELPER VIEW */}
                {!isCreator && currentUserId !== null && (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.indigo }]} onPress={() => handleContact(requestData.requester_phone, 'Contact Requester')}>
                            <Text style={styles.actionButtonText}>Contact</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: requestData.status === 'Matched' ? COLORS.lightSubtext : (hasApplied ? COLORS.urgentOrange : COLORS.royalBlue) }]} 
                            onPress={hasApplied ? handleCancelAccept : handleApply} 
                            disabled={requestData.status === 'Matched'}
                        >
                            <Text style={styles.actionButtonText}>
                                {requestData.status === 'Matched' ? 'Matched' : (hasApplied ? 'Cancel Accept' : 'Apply')}
                            </Text>
                        </TouchableOpacity>
                    </View>
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
                        <Text style={styles.modalTitle}>{modalTitle}</Text>
                        <Text style={styles.modalPhone}>{modalPhone}</Text>
                        
                        <TouchableOpacity style={[globalStyles.button, { marginTop: 24 }]} onPress={copyToClipboard}>
                            <Text style={globalStyles.buttonText}>Copy Number</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[globalStyles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.lightSubtext, marginTop: 12 }]} onPress={() => setModalVisible(false)}>
                            <Text style={[globalStyles.buttonText, { color: COLORS.indigo }]} >Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={applicantModalVisible}
                onRequestClose={() => setApplicantModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedApplicant && (
                            <>
                                <Text style={styles.modalTitle}>Applicant Details</Text>
                                <View style={{ width: '100%', alignItems: 'center', marginBottom: 24 }}>
                                    <Text style={{ fontSize: 18, color: COLORS.royalBlue, fontWeight: 'bold', marginBottom: 8 }}>{selectedApplicant.email}</Text>
                                    <Text style={{ fontSize: 16, color: COLORS.lightText }}>{selectedApplicant.first_name || 'User'} {selectedApplicant.last_name}</Text>
                                    {(selectedApplicant.latitude && selectedApplicant.longitude) ? (
                                        <Text style={{ fontSize: 14, color: COLORS.lightSubtext, marginTop: 8 }}>
                                            📍 Location: {selectedApplicant.latitude}, {selectedApplicant.longitude}
                                        </Text>
                                    ) : (
                                        <Text style={{ fontSize: 14, color: COLORS.lightSubtext, marginTop: 8, fontStyle: 'italic' }}>
                                            📍 Location not provided
                                        </Text>
                                    )}
                                </View>
                                
                                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                                    <TouchableOpacity 
                                        style={[globalStyles.button, { flex: 1, backgroundColor: COLORS.indigo, marginRight: 8 }]} 
                                        onPress={() => { setApplicantModalVisible(false); handleContact(selectedApplicant.mobile_number, 'Contact Applicant'); }}
                                    >
                                        <Text style={globalStyles.buttonText}>Contact</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[globalStyles.button, { flex: 1, backgroundColor: COLORS.success, marginLeft: 8 }]} 
                                        onPress={() => { setApplicantModalVisible(false); handleSelectHelper(selectedApplicant.id); }}
                                    >
                                        <Text style={globalStyles.buttonText}>Select Match</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <TouchableOpacity style={[globalStyles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.lightSubtext, marginTop: 16, width: '100%' }]} onPress={() => setApplicantModalVisible(false)}>
                                    <Text style={[globalStyles.buttonText, { color: COLORS.indigo }]}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
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
    detailCard: {
        backgroundColor: COLORS.lightCard,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    label: {
        fontSize: 12,
        color: COLORS.lightSubtext,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        color: COLORS.lightText,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 6,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    applicantCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    applicantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.royalBlue,
    },
    applicantPhone: {
        fontSize: 12,
        color: COLORS.lightSubtext,
        marginTop: 4,
    },
    selectBtn: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    selectBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
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
