import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

interface RecipeServingsDropdownProps {
    value: number;
    onValueChange: (value: number) => void;
}

const { width, height } = Dimensions.get('window');

const RecipeServingsDropdown: React.FC<RecipeServingsDropdownProps> = ({
    value,
    onValueChange
}) => {
    const numbers = Array.from({ length: 20 }, (_, i) => i + 1); // Generates numbers from 1 to 10    

    const [showServingsModal, setShowServingsModal] = React.useState(false);

    const handleSelection = (selectedValue: number) => {
        onValueChange(selectedValue);
        setShowServingsModal(false);
    }
    
    return (
        <View style={styles.servingsContainer}>
            <TouchableOpacity 
                style={styles.servingsButton}
                onPress={() => setShowServingsModal(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.servingsButtonText}>{value}</Text>
                <Text style={styles.servingsButtonIcon}>▼</Text>
            </TouchableOpacity>
            
            <Modal
                visible={showServingsModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowServingsModal(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowServingsModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Servings</Text>
                        <FlatList
                            data={numbers}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.servingOption,
                                        item === value && styles.servingOptionSelected
                                    ]}
                                    onPress={() => {
                                        handleSelection(item);
                                    }}
                                >
                                    <Text style={[
                                        styles.servingOptionText,
                                        item === value && styles.servingOptionTextSelected
                                    ]}>
                                        {item}
                                    </Text>
                                    {item === value && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                            style={styles.servingsList}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
};

const styles = StyleSheet.create({
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

export default RecipeServingsDropdown;