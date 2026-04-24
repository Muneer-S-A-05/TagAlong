import { StyleSheet, Platform } from 'react-native';

export const COLORS = {
    obsidian: '#0B0B0B',
    charcoal: '#1A1A1A',
    cyan: '#00F3FF',
    white: '#FFFFFF',
    error: '#FF4444',
    success: '#00FF00',
    transparentCyan: 'rgba(0, 243, 255, 0.1)',
    glassBackground: 'rgba(26, 26, 26, 0.6)',
    glassBorder: 'rgba(0, 243, 255, 0.2)',
    // Light Theme
    lightBackground: '#F0F4F8',
    lightCard: '#FFFFFF',
    lightText: '#0F172A',
    lightSubtext: '#475569',
    royalBlue: '#1E3A8A',
    indigo: '#4F46E5',
    urgentOrange: '#FF3B30',
};

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.obsidian,
    },
    lightContainer: {
        flex: 1,
        backgroundColor: COLORS.lightBackground,
    },
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        color: COLORS.cyan,
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        color: '#CCC',
        fontSize: 16,
        marginBottom: 32,
        textAlign: 'center',
    },
    glassPanel: {
        width: '100%',
        backgroundColor: COLORS.glassBackground,
        borderColor: COLORS.glassBorder,
        borderWidth: 1,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    input: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        color: COLORS.white,
        padding: 14,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: COLORS.indigo,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkText: {
        color: COLORS.cyan,
        marginTop: 16,
        textAlign: 'center',
    },
    errorText: {
        color: COLORS.error,
        marginBottom: 16,
        textAlign: 'center',
    }
});
