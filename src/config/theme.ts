import { DefaultTheme } from 'react-native-paper';

export const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#4A6FA5',
        accent: '#166088',
        background: '#F5F5F5',
        surface: '#FFFFFF',
        text: '#333333',
        placeholder: '#999999',
        backdrop: 'rgba(0, 0, 0, 0.5)',
        notification: '#FFB74D',
        error: '#E57373',
        success: '#81C784',
        warning: '#FFB74D',
        info: '#64B5F6',
        disabled: '#BDBDBD',

        // Custom colors for the app
        cardBackground: '#FFFFFF',
        headerBackground: '#4A6FA5',
        headerText: '#FFFFFF',
        tabBarBackground: '#FFFFFF',
        tabBarActive: '#4A6FA5',
        tabBarInactive: '#999999',

        // Emotional state colors
        emotionPositive: '#81C784',
        emotionNeutral: '#FFB74D',
        emotionNegative: '#E57373',
        emotionAnxious: '#9FA8DA',
        emotionFrustrated: '#FFAB91',
        emotionSad: '#90CAF9',
        emotionOverwhelmed: '#CE93D8',
    },

    roundness: 8,

    fonts: {
        regular: {
            fontFamily: 'System',
            fontWeight: '400' as const,
        },
        medium: {
            fontFamily: 'System',
            fontWeight: '500' as const,
        },
        light: {
            fontFamily: 'System',
            fontWeight: '300' as const,
        },
        thin: {
            fontFamily: 'System',
            fontWeight: '100' as const,
        },
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },

    borderRadius: {
        sm: 4,
        md: 8,
        lg: 16,
        xl: 24,
    },

    elevation: {
        sm: 2,
        md: 4,
        lg: 8,
        xl: 12,
    },
};
