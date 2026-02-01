import axios, {AxiosResponse} from 'axios';
import {RecipeList, Recipe, RecipeInformation, Ingredient } from '../types/index';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SPOON_API_URL = 'https://api.spoonacular.com';
const SPOON_API_KEY = process.env.SPOON_API_KEY;
console.log('Spoonacular API Key loaded:', process.env.SPOON_API_KEY ? 'Yes' : 'No');
console.log('Key starts with:', process.env.SPOON_API_KEY?.substring(0, 7));

if (!SPOON_API_KEY) {
  throw new Error('Spoonacular API key is not set');
}


export const generateSearchResults = async (recipeQuery: string): Promise<RecipeList> => {
    if (!recipeQuery?.trim()) {
        throw new Error("Please enter a recipe in the search box.");
    }

    try {
        const response = await axios.get(`${SPOON_API_URL}/recipes/complexSearch`, {
            params: {
                query: recipeQuery,
                number: 10,
            },
            headers: {
                'x-api-key': SPOON_API_KEY,
            }
        });

        // Transform while extracting only needed fields
        const recipes = response.data.results.map((item: any): Recipe => {
            if (!item.id || !item.title) {
                throw new Error('Recipe item missing required fields');
            }
            return { id: item.id, title: item.title };
        });

        return { recipes };
    } catch (error) {
        console.error('Error generating search results:', error);
        throw new Error('Failed to generate search results');
    }
}

export const getRecipeInformation = async(recipeId: number): Promise<RecipeInformation> => {
    if (!recipeId) {
        throw new Error("Invalid recipe ID.")
    }

    try {
        const response = await axios.get(`${SPOON_API_URL}/recipes/${recipeId}/information`, {
            params: {
                includeNutrition: false,
            },
            headers: {
                'x-api-key': SPOON_API_KEY,
            }
        });

        // Extract relevant information
        const recipeInformation = response.data.extendedIngredients.map((ingredient: any): Ingredient => ({
            original_name: ingredient.original,
            name: ingredient.nameClean,
            quantity: ingredient.measures.us.amount + ' ' + ingredient.measures.us.unitLong,
            aisle: ingredient.aisle,
            id: ingredient.id,
        }));

        return { recipeInformation }
    } catch (error) {
        console.error('Error fetching recipe information:', error);
        throw new Error('Failed to fetch recipe information');
    }
}

export const getRecipeInstructions = async(recipeId: number) => {
    if (!recipeId) {
        throw new Error("Invalid recipe ID.")
    }

    try {
        const response = await axios.get(`${SPOON_API_URL}/recipes/${recipeId}/analyzedInstructions`, {
            params: {
                id: recipeId,
                stepBreakdown: false,
            },
            headers: {
                'x-api-key': SPOON_API_KEY,
            }
        });

        //  Extract relevant information
        const recipeInstructions = response.data.map((instruction: any) => instruction.steps.map((step: any) => step.step)).flat();
        return { recipeInstructions };
    } catch (error) {
        console.error('Error fetching recipe instructions:', error);
        throw new Error('Failed to fetch recipe instructions');
    }
}