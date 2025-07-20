import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    FlatList, 
    StyleSheet, 
    TouchableOpacity, 
    SafeAreaView,
    StatusBar,
    Dimensions,
    Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fuse from 'fuse.js';
import groceryDatabaseJson from '../groceryDatabase.json';
const groceryDatabase: Record<string, string> = groceryDatabaseJson;

interface GroceryItem {
    id: string;
    title: string;
    notes?: string;
    completed: boolean;
    category?: string;
    name?: string; // Added for items from recipes
    quantity?: string; // Added for items from recipes
}

type GroceryChecklistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroceryChecklist'>;

const { width } = Dimensions.get('window');

// Fuzzy search setup
const fuse = new Fuse(Object.keys(groceryDatabase), { includeScore: true, threshold: 0.3 });

function assignCategory(itemName: string): string {
    // Exact match
    if (groceryDatabase[itemName]) {
        return groceryDatabase[itemName];
    }
    // Fuzzy match
    const result = fuse.search(itemName);
    if (result.length > 0 && result[0].score! < 0.3) {
        return groceryDatabase[result[0].item];
    }
    return 'Other';
}

function sortGroceryItemsByCategory(items: GroceryItem[]): GroceryItem[] {
    return items.slice().sort((a, b) => {
        if ((a.category || '') === (b.category || '')) return 0;
        if ((a.category || '') === 'Other') return 1;
        if ((b.category || '') === 'Other') return -1;
        return (a.category || '').localeCompare(b.category || '');
    });
}

const GroceryChecklistScreen = () => {
    const navigation = useNavigation<GroceryChecklistScreenNavigationProp>();

    const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
    const [newItem, setNewItem] = useState('');
    const [newNotes, setNewNotes] = useState('');

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        const stored = await AsyncStorage.getItem('groceryList');
        const loaded = stored ? JSON.parse(stored) : [];
        setGroceryItems(loaded.filter((item: any) => item && typeof item === 'object' && 'completed' in item));
    }

    const addGroceryItem = async () => {
        if (newItem.trim() === '') {
            Alert.alert('Empty Item', 'Please enter an item name');
            return;
        }
        const category = assignCategory(newItem.trim());
        const newGroceryItem: GroceryItem = {
            id: crypto.randomUUID(),
            title: newItem.trim(),
            notes: newNotes.trim() || undefined,
            completed: false,
            category,
        };
        const newGroceryList = sortGroceryItemsByCategory([...groceryItems, newGroceryItem]);
        setGroceryItems(newGroceryList);
        console.log(newGroceryList);
        setNewItem('');
        setNewNotes('');
        await AsyncStorage.setItem('groceryList', JSON.stringify(newGroceryList));
    };

    const clearItems = async () => {
        const completedCount = groceryItems.filter(item => item.completed).length;
        if (completedCount === 0) {
            Alert.alert('No Items', 'No completed items to clear');
            return;
        }
        
        const newGroceryList = sortGroceryItemsByCategory(groceryItems.filter(item => !item.completed));
        setGroceryItems(newGroceryList);
        await AsyncStorage.setItem('groceryList', JSON.stringify(newGroceryList));
    };

    const selectAllItems = async () => {
        const allCompleted = groceryItems.every(item => item.completed);
        const newGroceryList = groceryItems.map(item => ({
            ...item,
            completed: !allCompleted
        }));
        setGroceryItems(newGroceryList);
        await AsyncStorage.setItem('groceryList', JSON.stringify(newGroceryList));
    };

    const toggleGroceryItem = async (id: string) => {
        const newGroceryList = groceryItems.map(item => 
            item.id === id ? { ...item, completed: !item.completed } : item
        );
        setGroceryItems(newGroceryList);
        await AsyncStorage.setItem('groceryList', JSON.stringify(newGroceryList));
    };

    const completedCount = groceryItems.filter((item: any) => item && item.completed).length;
    const totalCount = groceryItems.filter((item: any) => item && typeof item === 'object' && 'completed' in item).length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const allCompleted = totalCount > 0 && completedCount === totalCount;

    const renderItem = ({ item, index }: { item: GroceryItem; index: number }) => (
        <TouchableOpacity
            style={[styles.itemContainer, item.completed && styles.itemCompleted]}
            onPress={() => toggleGroceryItem(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.itemContent}>
                <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                    {item.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.textContainer}>
                    <Text style={[
                        styles.itemText,
                        item.completed && styles.itemTextCompleted
                    ]}>
                        {item.name || item.title}
                    </Text>
                    {(item.quantity || item.notes) && (
                        <Text style={[
                            styles.notesText,
                            item.completed && styles.notesTextCompleted
                        ]}>
                            {item.quantity || item.notes}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add items to get started with your shopping list</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Shopping List</Text>
                {totalCount > 0 && (
                    <View style={styles.headerButtons}>
                        <TouchableOpacity 
                            style={styles.selectAllButton}
                            onPress={selectAllItems}
                        >
                            <Text style={styles.selectAllButtonText}>
                                {allCompleted ? 'Deselect All' : 'Select All'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.clearButton}
                            onPress={clearItems}
                        >
                            <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Progress Indicator */}
            {totalCount > 0 && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { width: `${progressPercentage}%` }
                            ]} 
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {completedCount} of {totalCount} completed
                    </Text>
                </View>
            )}

            {/* List */}
            <View style={styles.listContainer}>
                <FlatList
                    data={groceryItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={groceryItems.length === 0 ? styles.emptyListContainer : null}
                />
            </View>

            {/* Input Section */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Add new item..."
                            placeholderTextColor="#999"
                            value={newItem}
                            onChangeText={setNewItem}
                            onSubmitEditing={addGroceryItem}
                            returnKeyType="done"
                        />
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Add notes (optional)..."
                            placeholderTextColor="#aaa"
                            value={newNotes}
                            onChangeText={setNewNotes}
                            onSubmitEditing={addGroceryItem}
                            returnKeyType="done"
                        />
                    </View>
                    <TouchableOpacity 
                        style={[styles.addButton, !newItem.trim() && styles.addButtonDisabled]}
                        onPress={addGroceryItem}
                        disabled={!newItem.trim()}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    style={styles.recipeButton}
                    onPress={() => navigation.navigate('RecipeSearch')}
                >
                    <Text style={styles.recipeButtonText}>📝 Add from Recipe</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#212529',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    selectAllButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 16,
    },
    selectAllButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    clearButton: {
        backgroundColor: '#dc3545',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 16,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e9ecef',
        borderRadius: 3,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#28a745',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 22,
    },
    itemContainer: {
        backgroundColor: '#fff',
        marginVertical: 4,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemCompleted: {
        backgroundColor: '#f8f9fa',
        opacity: 0.7,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#28a745',
        marginRight: 16,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#28a745',
        borderColor: '#28a745',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    textContainer: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        color: '#212529',
        lineHeight: 22,
        marginBottom: 2,
    },
    itemTextCompleted: {
        textDecorationLine: 'line-through',
        color: '#6c757d',
    },
    notesText: {
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 18,
        fontStyle: 'italic',
    },
    notesTextCompleted: {
        textDecorationLine: 'line-through',
        color: '#adb5bd',
    },
    inputContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    inputWrapper: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    textInputContainer: {
        flex: 1,
        marginRight: 12,
    },
    textInput: {
        height: 48,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#212529',
        marginBottom: 8,
    },
    notesInput: {
        minHeight: 40,
        maxHeight: 80,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#212529',
        textAlignVertical: 'top',
    },
    addButton: {
        width: 48,
        height: 96,
        backgroundColor: '#007bff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: '#adb5bd',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '400',
    },
    recipeButton: {
        backgroundColor: '#6f42c1',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    recipeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default GroceryChecklistScreen;