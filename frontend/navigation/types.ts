import {GroceryCategory, GroceryList} from '../types'

export type RootStackParamList = {
    GroceryChecklist: undefined;
    RecipeSearch: undefined;
    RecipeDetails: { recipeName: string, servings: number };
};