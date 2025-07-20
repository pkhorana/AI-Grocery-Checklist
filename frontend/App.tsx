import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList  } from './navigation/types';

// Your screens
import GroceryChecklistScreen from './screens/GroceryChecklistScreen';
import RecipeSearchScreen from './screens/RecipeSearchScreen';
import RecipeDetailsScreen from './screens/RecipeDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="GroceryChecklist">
        <Stack.Screen name="GroceryChecklist" component={GroceryChecklistScreen} />
        <Stack.Screen name="RecipeSearch" component={RecipeSearchScreen} />
        <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    // <View style={styles.container}>
    //   <GroceryChecklistScreen />
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
