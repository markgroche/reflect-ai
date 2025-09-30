/**
 * Journal Screen
 * Main screen for viewing and managing journal entries
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FAB } from 'react-native-paper';
import { format } from 'date-fns';
import { useJournal } from '../contexts/JournalContext';
import { JournalEntry, RootStackParamList } from '../types';
import { theme } from '../config/theme';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export const JournalScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { entries, loadEntries, isLoading } = useJournal();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadEntries();
        }, [])
    );

    React.useEffect(() => {
        if (searchQuery) {
            const filtered = entries.filter(entry =>
                entry.clientIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.sessionNotes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredEntries(filtered);
        } else {
            setFilteredEntries(entries);
        }
    }, [searchQuery, entries]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadEntries();
        setRefreshing(false);
    };

    const handleEntryPress = (entry: JournalEntry) => {
        navigation.navigate('EntryDetail', { entryId: entry.id });
    };

    const handleNewEntry = () => {
        navigation.navigate('NewEntry');
    };

    const getEmotionColor = (emotion: string): string => {
        const emotionColors: Record<string, string> = {
            calm: theme.colors.emotionPositive,
            confident: theme.colors.emotionPositive,
            satisfied: theme.colors.emotionPositive,
            hopeful: theme.colors.emotionPositive,
            anxious: theme.colors.emotionAnxious,
            frustrated: theme.colors.emotionFrustrated,
            sad: theme.colors.emotionSad,
            overwhelmed: theme.colors.emotionOverwhelmed,
            uncertain: theme.colors.emotionNeutral,
            concerned: theme.colors.emotionNeutral,
            exhausted: theme.colors.emotionNegative,
            engaged: theme.colors.emotionPositive,
        };
        return emotionColors[emotion] || theme.colors.emotionNeutral;
    };

    const renderEntry = ({ item }: { item: JournalEntry }) => (
        <TouchableOpacity
            style={styles.entryCard}
            onPress={() => handleEntryPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.entryHeader}>
                <View style={styles.entryHeaderLeft}>
                    <Text style={styles.clientIdentifier}>
                        {item.clientIdentifier}
                    </Text>
                    <Text style={styles.sessionDate}>
                        {format(new Date(item.sessionDate), 'MMM dd, yyyy • h:mm a')}
                    </Text>
                </View>
                <View
                    style={[
                        styles.emotionIndicator,
                        { backgroundColor: getEmotionColor(item.emotionalState.primary) },
                    ]}
                >
                    <Text style={styles.emotionText}>
                        {item.emotionalState.primary}
                    </Text>
                </View>
            </View>

            <Text style={styles.notesPreview} numberOfLines={2}>
                {item.sessionNotes}
            </Text>

            {item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {item.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                    {item.tags.length > 3 && (
                        <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
                    )}
                </View>
            )}

            <View style={styles.entryFooter}>
                {item.aiConversationId && (
                    <View style={styles.conversationIndicator}>
                        <Icon name="message-text" size={16} color={theme.colors.primary} />
                        <Text style={styles.conversationText}>Reflection</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="notebook-outline" size={80} color={theme.colors.placeholder} />
            <Text style={styles.emptyStateTitle}>No Journal Entries Yet</Text>
            <Text style={styles.emptyStateText}>
                Start by creating your first session entry
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleNewEntry}>
                <Text style={styles.emptyStateButtonText}>Create First Entry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={theme.colors.placeholder} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={theme.colors.placeholder}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close-circle" size={20} color={theme.colors.placeholder} />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredEntries}
                renderItem={renderEntry}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    filteredEntries.length === 0 && styles.emptyListContent,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={handleNewEntry}
                color="#FFF"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchInput: {
        flex: 1,
        marginHorizontal: 12,
        fontSize: 16,
        color: theme.colors.text,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    emptyListContent: {
        flex: 1,
    },
    entryCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    entryHeaderLeft: {
        flex: 1,
    },
    clientIdentifier: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    sessionDate: {
        fontSize: 12,
        color: theme.colors.placeholder,
    },
    emotionIndicator: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    emotionText: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    notesPreview: {
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tag: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 11,
        color: theme.colors.primary,
    },
    moreTagsText: {
        fontSize: 11,
        color: theme.colors.placeholder,
        alignSelf: 'center',
    },
    entryFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    conversationIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    conversationText: {
        fontSize: 12,
        color: theme.colors.primary,
        marginLeft: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: 20,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: theme.colors.placeholder,
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyStateButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyStateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
    },
});
