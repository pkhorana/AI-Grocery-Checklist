import axios, {AxiosResponse} from 'axios';
import {GroceryList, OpenAIResponse } from '../types/index';
import fs from 'fs';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = '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';


if (!OPENAI_API_KEY) {
  throw new Error('OpenAI API key is not set');
}


// function parameters come after the equals sign.
export const generateGroceryList = async (recipeName: String, numOfServings: number) => {

    if (!recipeName || numOfServings <= 0) {
        throw new Error('Recipe name and number of servings are required');
    }

    try {
        console.log('Generating grocery list for recipe:', recipeName);
        const outputRequirements = fs.readFileSync('./prompts/output_requirements.txt', 'utf8');
        const conversionGuidelines = fs.readFileSync('./prompts/conversion_guidelines.txt', 'utf8');
        const categoryGuidelines = fs.readFileSync('./prompts/category_guidelines.txt', 'utf8');
        const examples = fs.readFileSync('./prompts/examples.txt', 'utf8');

        const prompt = `
            You are a helpful assistant that creates grocery lists based on recipes.

            The user wants to cooks a recipe. They can easily find the ingredients for the recipe online, but it can be difficult to know what & how much of each ingredient to buy from the grocery store.
            The measurements in recipes are often in cups, tablespoons, or other units that are not directly related to how ingredients are sold in grocery stores (e.g., a cup of flour vs. a bag of flour). 

            Your task is to take a given recipe, find its ingredients and their quanitites, and translate them into a clear, actionable grocery list, optimized for how items are typically sold in stores.
            Please create a grocery list for ${numOfServings} of the following recipe: ${recipeName}.

            Please think step by step. 
            1. First, identify the ingredients and their quantities from the recipe based on the number of servings specified. 
            2. Next, convert these quantities into common grocery store packaging sizes. 
            3. Then assign these items into the following categories based on how they are typically sold in grocery stores:
            Produce, Meats, Dairy, Frozen Food, Bakery & Bread, Grains & Pasta, Canned Goods, Oils & Sauces, Spices & Baking Supplies, Deli, Pantry Staples/Dry Goods.
            4. Finally, format the grocery list in a clear and concise manner, listing each ingredient with its corresponding quantity.

            <Output Requirements>
            ${outputRequirements}

            <Conversion Guidelines & Assumptions>
            ${conversionGuidelines}

            <Category Guidelines>
            ${categoryGuidelines}

            <Examples>
            ${examples}
        `;


        // first specify variable, then type w/ generics
        const response: AxiosResponse<OpenAIResponse> = await axios.post(
            OPENAI_API_URL,
            {
                model: 'gpt-4.1',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ], 
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const groceryListText = response.data.choices[0].message.content.trim();
        console.log('Grocery list text:', groceryListText);

        try {
            const groceryList: GroceryList = JSON.parse(groceryListText);

            if (!groceryList.grocery_list || !Array.isArray(groceryList.ingredients)) {
                throw new Error('Invalid grocery list format');
            }

            return groceryList;
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', groceryListText);
            throw new Error('Failed to parse grocery list response');
        }

    } catch (error) {
        console.error('Error generating grocery list:', error);
        throw new Error('Failed to generate grocery list');
    }
}

export const generateSearchResults = async(recipeName: string) => {
    if (!recipeName) {
        throw new Error("Please enter a recipe in the search box.")
    }
    try {
        console.log("Generating search results");

        const prompt = `
            Your task is to give variations of recipe names given the following recipe: ${recipeName}. 
            
            Please output the response as a list formatted as the following:
            ["recipe name 1", "recipe name 2", "recipe name 3", ...]

            Please limit the response to 4-5 items as the most.
        `

        // first specify variable, then type w/ generics
        const response: AxiosResponse<OpenAIResponse> = await axios.post(
            OPENAI_API_URL,
            {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ], 
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const searchResults = response.data.choices[0].message.content.trim();
        console.log('Search results: ', searchResults);

        try {
            const results: String[] = JSON.parse(searchResults);

            if (!results || !Array.isArray(results)) {
                throw new Error('Invalid search results format');
            }

            return results;
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', searchResults);
            throw new Error('Failed to parse search results response');
        }
    } catch (error) {
        console.error('Error generating search results:', error);
        throw new Error('Failed to generate search results');
    }
}
