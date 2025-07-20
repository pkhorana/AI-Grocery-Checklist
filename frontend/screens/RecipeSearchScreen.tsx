import React from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { generateSearchResults } from '../services/apiService';
import RecipeServingsDropdown from '../components/RecipeServingsDropdown';

interface Recipe {
    name: string;
    cuisine?: string;
    cookTime?: string;
    difficulty?: string;
    servings?: number;
}

type RecipeSearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecipeSearch'>;

const { width, height } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_MARGIN = 8;
const ITEMS_PER_ROW = width > 400 ? 2 : 1; // Single column for smaller screens
const ITEM_WIDTH = ITEMS_PER_ROW === 1 ?
    width - (HORIZONTAL_PADDING * 2) :
    (width - (HORIZONTAL_PADDING * 2) - CARD_MARGIN) / 2;

const RecipeSearchScreen = () => {
    const navigation = useNavigation<RecipeSearchScreenNavigationProp>();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [suggestedRecipes, setSuggestedRecipes] = React.useState<Recipe[]>([]);
    const [numOfServings, setNumOfServings] = React.useState(4);
    const [searchResults, setSearchResults] = React.useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [showServingsModal, setShowServingsModal] = React.useState(false);

    // Mock popular/suggested recipes
    const popularRecipes: Recipe[] = [
        { name: 'Chicken Parmesan', cuisine: 'Italian', cookTime: '30 min', difficulty: 'Medium', servings: numOfServings },
        { name: 'Beef Stir Fry', cuisine: 'Asian', cookTime: '20 min', difficulty: 'Easy', servings: numOfServings },
        { name: 'Caesar Salad', cuisine: 'American', cookTime: '15 min', difficulty: 'Easy', servings: numOfServings },
        { name: 'Pasta Carbonara', cuisine: 'Italian', cookTime: '25 min', difficulty: 'Medium', servings: numOfServings },
        { name: 'Fish Tacos', cuisine: 'Mexican', cookTime: '35 min', difficulty: 'Medium', servings: numOfServings },
        { name: 'Veggie Burger', cuisine: 'American', cookTime: '20 min', difficulty: 'Easy', servings: numOfServings },
    ];

    React.useEffect(() => {
        setSuggestedRecipes(popularRecipes);
    }, []);

    const fetchRecipes = async (query: string) => {
        if (!query.trim()) return;

        setIsLoading(true);
        setHasSearched(true);

        try {
            // Simulate an API call to fetch recipes based on the search query
            const response = generateSearchResults(query);
            console.log('Search results:', response);
            const recipes: Recipe[] = (await response).map((name: string) => ({
                name,
                cuisine: 'Unknown',
                cookTime: 'Unknown',
                difficulty: 'Unknown',
                servings: numOfServings, // Default value
            }));
            setSearchResults(recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        fetchRecipes(searchQuery);
    };

    const handleRecipePress = (recipe: Recipe) => {
        navigation.navigate('RecipeDetails', { recipeName: recipe.name, servings: numOfServings });
        console.log('Navigating to recipe details:', recipe);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return '#4CAF50';
            case 'medium': return '#FF9800';
            case 'hard': return '#F44336';
            default: return '#757575';
        }
    };

    const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

    const renderRecipeCard = ({ item, index }: { item: Recipe; index: number }) => (
        <TouchableOpacity
            style={[
                styles.recipeCard,
                ITEMS_PER_ROW === 2 && index % 2 === 0 ? { marginRight: CARD_MARGIN } : {},
            ]}
            onPress={() => handleRecipePress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.recipeName} numberOfLines={2}>{item.name}</Text>
                    {item.difficulty && (
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                            <Text style={styles.difficultyText}>{item.difficulty}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardDetails}>
                    {item.cuisine && (
                        <Text style={styles.cuisineText}>{item.cuisine}</Text>
                    )}
                    <View style={styles.metaInfo}>
                        {item.cookTime && (
                            <View style={styles.metaItem}>
                                <Text style={styles.metaIcon}>⏱</Text>
                                <Text style={styles.metaText}>{item.cookTime}</Text>
                            </View>
                        )}
                        {item.servings && (
                            <View style={styles.metaItem}>
                                <Text style={styles.metaIcon}>👥</Text>
                                <Text style={styles.metaText}>{numOfServings}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const displayRecipes = hasSearched ? searchResults : suggestedRecipes;
    const sectionTitle = hasSearched ?
        (searchResults.length > 0 ? `Search Results (${searchResults.length})` : 'No Results Found') :
        'Popular Recipes';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Find Recipes</Text>
                <Text style={styles.headerSubtitle}>Search for delicious recipes to add to your grocery list</Text>
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search recipes or cuisine..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        placeholderTextColor="#999"
                    />
                    {/* {renderDropDown()} */}
                    <RecipeServingsDropdown
                        value={numOfServings}
                        onValueChange={setNumOfServings}
                    />
                    <TouchableOpacity
                        style={[
                            styles.searchButton,
                            !searchQuery.trim() && styles.searchButtonDisabled
                        ]}
                        onPress={handleSearch}
                        disabled={!searchQuery.trim()}
                    >
                        <Text style={styles.searchButtonText}>🔍</Text>
                    </TouchableOpacity>
                </View>

                {hasSearched && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setHasSearched(false);
                        }}
                    >
                        <Text style={styles.clearButtonText}>← Show Popular</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Results Section */}
            <View style={styles.resultsSection}>
            {!isLoading &&
                <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            }


                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Finding delicious recipes...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={displayRecipes}
                        renderItem={renderRecipeCard}
                        keyExtractor={(item, index) => `${item.name}-${index}`}
                        numColumns={ITEMS_PER_ROW}
                        key={ITEMS_PER_ROW} // Force re-render when columns change
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.recipesList}
                        ListEmptyComponent={
                            hasSearched ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyIcon}>🍽️</Text>
                                    <Text style={styles.emptyText}>No recipes found</Text>
                                    <Text style={styles.emptySubtext}>Try searching for something else</Text>
                                </View>
                            ) : null
                        }
                    />
                )}
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
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: width > 400 ? 28 : 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: width > 400 ? 16 : 14,
        color: '#666',
        lineHeight: 20,
    },
    searchSection: {
        backgroundColor: '#fff',
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        backgroundColor: '#f5f5f5',
        borderRadius: 22,
        paddingHorizontal: 18,
        fontSize: 16,
        color: '#333',
    },
    searchButton: {
        width: 44,
        height: 44,
        backgroundColor: '#007AFF',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonDisabled: {
        backgroundColor: '#ccc',
    },
    searchButtonText: {
        fontSize: 18,
    },
    clearButton: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
    },
    clearButtonText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    resultsSection: {
        flex: 1,
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    recipesList: {
        paddingBottom: 20,
    },
    recipeCard: {
        width: ITEM_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        marginBottom: 12,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        lineHeight: 22,
        minHeight: 22, // Ensure consistent height
    },
    difficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    difficultyText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    cardDetails: {
        gap: 8,
    },
    cuisineText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaIcon: {
        fontSize: 12,
    },
    metaText: {
        fontSize: 12,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    servingsContainer: {
        justifyContent: 'center',
    },
    servingsButton: {
        backgroundColor: '#f5f5f5',
        borderRadius: 22,
        height: 44,
        minWidth: 70,
        maxWidth: 90,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 6,
    },
    servingsButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    servingsButtonIcon: {
        fontSize: 10,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: width * 0.7,
        maxHeight: height * 0.6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    servingsList: {
        maxHeight: height * 0.4,
    },
    servingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4,
    },
    servingOptionSelected: {
        backgroundColor: '#007AFF',
    },
    servingOptionText: {
        fontSize: 16,
        color: '#333',
    },
    servingOptionTextSelected: {
        color: '#fff',
        fontWeight: '500',
    },
    checkmark: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default RecipeSearchScreen;