import React, {useState, useEffect, useRef} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, SectionList, Platform, ScrollView, Animated, Easing } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {GroceryList, GroceryCategory, GroceryItem} from '../types';
import { generateGroceryList } from '../services/apiService';
import { ActivityIndicator } from 'react-native-paper';
import {mockGroceryList, mockIngredients } from '../mocks/mockObjects';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RecipeDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecipeDetails'>;
type RecipeDetailsScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetails'>;

// function sortGroceryItemsByCategory(items: GroceryItem[]): GroceryItem[] {
//     return items.slice().sort((a, b) => {
//         const catA = a.category || 'ZZZ';
//         const catB = b.category || 'ZZZ';
//         if (catA === 'Other' && catB !== 'Other') return 1;
//         if (catB === 'Other' && catA !== 'Other') return -1;
//         return catA.localeCompare(catB);
//     });
// }

function sortGroceryItemsByCategory(items: GroceryItem[]): GroceryItem[] {
    return items.slice().sort((a, b) => {
        if ((a.category || '') === (b.category || '')) return 0;
        if ((a.category || '') === 'Other') return 1;
        if ((b.category || '') === 'Other') return -1;
        return (a.category || '').localeCompare(b.category || '');
    });
}

const RecipeDetailsScreen = () => {
    const navigation = useNavigation<RecipeDetailsScreenNavigationProp>();
    const route = useRoute<RecipeDetailsScreenRouteProp>();

    const recipeName = route.params.recipeName;
    const numServings = route.params.servings;

    const [isLoading, setIsLoading] = useState(false);

    const [groceryList, setGroceryList] = useState<GroceryCategory>({});
    const [ingredients, setIngredients] = useState<String[]>([]);

    const groceryListData = groceryList ?
    Object.entries(groceryList).map(([category, items]) => 
    (
        {
            title: category,
            data: items
        }
    )) : [];

    const handleGenerateGroceryList = async (): Promise<void> => {
        setIsLoading(true);

        try {
            console.log('Generating grocery list for recipe:', recipeName);
            console.log('Number of servings:', numServings);
            const groceryListResponse = await generateGroceryList(recipeName, numServings);

            setGroceryList(groceryListResponse.grocery_list);
            setIngredients(groceryListResponse.ingredients);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occured';

            if (Platform.OS === 'web') {
                window.alert('Error: ' + errorMessage);
            } else {        
                Alert.alert(
                    'Error',
                    errorMessage,
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        // setGroceryList(mockGroceryList);
        // setIngredients(mockIngredients);
        handleGenerateGroceryList();
    }, []);

    const renderCategoryHeader = ({ section }: { section: { title: string } }) => (
        <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{section.title}</Text>
        </View>
    );

    const renderGroceryItem = ({ item } : { item: GroceryItem }) => (
        <View style={styles.groceryItem}>
            <Text style={styles.groceryItemText}>{item.name} - {item.quantity}</Text>
        </View>
    )

    const alertAddGroceryList = async () => {
        // Add logic to add recipe to grocery list

        const existing = await AsyncStorage.getItem('groceryList');
        const currentList = existing ? JSON.parse(existing) : [];
        const newItems = Object.entries(groceryList)
            .flatMap(([category, items]) =>
                items.map(item => ({
                    id: crypto.randomUUID(),
                    name: `${item.name}`,
                    quantity: `${item.quantity}`,
                    completed: false,
                    category
                }))
            );
        const sortedItems = sortGroceryItemsByCategory([...currentList, ...newItems]);
        await AsyncStorage.setItem('groceryList', JSON.stringify(sortedItems));
        navigation.navigate('GroceryChecklist');
    }


    // Replace LoadingSpinner component with:
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Generating your grocery list...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            
            <View style={styles.headerSection}>
                <Text style={styles.recipeName}>{recipeName}</Text>
                <Text style={styles.servingsText}>Number of Servings: {numServings}</Text>
            </View>

            {/* Grocery List Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Grocery List</Text>
                <View style={styles.groceryListContainer}>
                    <SectionList
                        sections={groceryListData}
                        keyExtractor={(item, index) => index.toString()}
                        renderSectionHeader={renderCategoryHeader}
                        renderItem={renderGroceryItem}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>

            
            {/* Ingredients Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <View style={styles.ingredientsContainer}>
                    {ingredients.map((ingredient, index) => (
                        <Text key={index} style={styles.ingredientItem}>{ingredient}</Text>
                    ))}
                </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity style={styles.addButton} onPress={alertAddGroceryList}>
                <Text style={styles.addButtonText}>Add Recipe to Grocery List</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 32,
    },
    loadingSpinner: {
        marginBottom: 24,
    },
    spinnerOuter: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 4,
        borderColor: '#e0e0e0',
        borderTopColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    spinnerInner: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f8ff',
        opacity: 0.8,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    headerSection: {
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    recipeName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    servingsText: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    groceryListContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryHeader: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 8,
        marginBottom: 4,
        borderRadius: 4,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    groceryItem: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginVertical: 2,
    },
    groceryItemText: {
        fontSize: 14,
        color: '#555',
    },
    ingredientsContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    ingredientItem: {
        fontSize: 14,
        color: '#555',
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginVertical: 2,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default RecipeDetailsScreen;