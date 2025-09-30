/**
 * New Entry Screen
 * Create a new journal entry for a therapy session
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import { useJournal } from '../contexts/JournalContext';
import { RootStackParamList, EmotionType } from '../types';
import { theme } from '../config/theme';

type NavigationProp = StackNavigationProp<RootStackParamList, 'NewEntry'>;

export const NewEntryScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { createEntry } = useJournal();

    const [clientIdentifier, setClientIdentifier] = useState('');
    const [sessionDate, setSessionDate] = useState(new Date());
    const [sessionNotes, setSessionNotes] = useState('');
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('calm');
    const [emotionIntensity, setEmotionIntensity] = useState(3);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const emotions: EmotionType[] = [
        'calm', 'anxious', 'frustrated', 'sad', 'overwhelmed',
        'confident', 'uncertain', 'satisfied', 'concerned',
        'hopeful', 'exhausted', 'engaged',
    ];

    const handleSave = async () => {
        if (!clientIdentifier.trim()) {
            Alert.alert('Missing Information', 'Please enter a client identifier');
            return;
        }

        if (!sessionNotes.trim()) {
            Alert.alert('Missing Information', 'Please enter session notes');
            return;
        }

        setIsSaving(true);
        try {
            const entryId = await createEntry({
                clientIdentifier: clientIdentifier.trim(),
                sessionDate,
                sessionNotes: sessionNotes.trim(),
                emotionalState: {
                    primary: selectedEmotion,
                    intensity: emotionIntensity as 1 | 2 | 3 | 4 | 5,
                },
                tags,
            });

            Alert.alert(
                'Entry Saved',
                'Your journal entry has been created successfully.',
                [
                    {
                        text: 'View Entry',
                        onPress: () => navigation.replace('EntryDetail', { entryId }),
                    },
                    {
                        text: 'Create Another',
                        onPress: () => {
                            setClientIdentifier('');
                            setSessionNotes('');
                            setSelectedEmotion('calm');
                            setEmotionIntensity(3);
                            setTags([]);
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to save journal entry. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.label}>Client Identifier *</Text>
                    <TextInput
                        style={styles.input}
                        value={clientIdentifier}
                        onChangeText={setClientIdentifier}
                        placeholder="Enter client initials or code"
                        placeholderTextColor={theme.colors.placeholder}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Session Date & Time *</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Icon name="calendar" size={20} color={theme.colors.primary} />
                        <Text style={styles.dateButtonText}>
                            {sessionDate.toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Session Notes *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={sessionNotes}
                        onChangeText={setSessionNotes}
                        placeholder="Describe the session, key themes, interventions used..."
                        placeholderTextColor={theme.colors.placeholder}
                        multiline
                        numberOfLines={8}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Your Emotional State</Text>
                    <View style={styles.emotionsGrid}>
                        {emotions.map(emotion => (
                            <TouchableOpacity
                                key={emotion}
                                style={[
                                    styles.emotionButton,
                                    selectedEmotion === emotion && styles.emotionButtonSelected,
                                ]}
                                onPress={() => setSelectedEmotion(emotion)}
                            >
                                <Text
                                    style={[
                                        styles.emotionButtonText,
                                        selectedEmotion === emotion && styles.emotionButtonTextSelected,
                                    ]}
                                >
                                    {emotion}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.subLabel}>Intensity: {emotionIntensity}</Text>
                    <View style={styles.intensityContainer}>
                        {[1, 2, 3, 4, 5].map(level => (
                            <TouchableOpacity
                                key={level}
                                style={[
                                    styles.intensityButton,
                                    level <= emotionIntensity && styles.intensityButtonActive,
                                ]}
                                onPress={() => setEmotionIntensity(level)}
                            >
                                <Text style={styles.intensityButtonText}>{level}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Tags</Text>
                    <View style={styles.tagInputContainer}>
                        <TextInput
                            style={styles.tagInput}
                            value={tagInput}
                            onChangeText={setTagInput}
                            placeholder="Add a tag..."
                            placeholderTextColor={theme.colors.placeholder}
                            onSubmitEditing={addTag}
                        />
                        <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                            <Icon name="plus" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tagsContainer}>
                        {tags.map(tag => (
                            <View key={tag} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                                <TouchableOpacity onPress={() => removeTag(tag)}>
                                    <Icon name="close" size={16} color={theme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save Entry'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <DatePicker
                modal
                open={showDatePicker}
                date={sessionDate}
                onConfirm={date => {
                    setShowDatePicker(false);
                    setSessionDate(date);
                }}
                onCancel={() => setShowDatePicker(false)}
                maximumDate={new Date()}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        padding: 16,
        backgroundColor: '#FFF',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
    },
    subLabel: {
        fontSize: 14,
        color: theme.colors.text,
        marginTop: 12,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: theme.colors.text,
    },
    textArea: {
        minHeight: 150,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    dateButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: theme.colors.text,
    },
    emotionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    emotionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        margin: 4,
        borderRadius: 16,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    emotionButtonSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    emotionButtonText: {
        fontSize: 14,
        color: theme.colors.text,
        textTransform: 'capitalize',
    },
    emotionButtonTextSelected: {
        color: '#FFF',
    },
    intensityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    intensityButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    intensityButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    intensityButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: theme.colors.text,
        marginRight: 8,
    },
    addTagButton: {
        backgroundColor: theme.colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 14,
        color: theme.colors.primary,
        marginRight: 4,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        marginHorizontal: 16,
        marginVertical: 24,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
