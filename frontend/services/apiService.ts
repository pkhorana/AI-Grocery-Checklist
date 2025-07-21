//frontend/services/apiService.ts
import { GroceryList, ApiResponse} from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError'
    }
}

export const generateGroceryList = async (recipeName: string, numOfServings: number): Promise<GroceryList> => {
    try {
        console.log('API_BASE_URL', API_BASE_URL);
        const response = await fetch(`${API_BASE_URL}/api/recigo/generate-grocery-list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipeName: recipeName,
                numOfServings: numOfServings
            })
        });
        console.log('response', response);

        if (!response.ok) {
            throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<GroceryList> = await response.json();

        if (!data.success || !data.data) {
            throw new Error(data.error || 'Failed to generate grocery list');
        }

        return data.data;
    } catch (error) {
        console.error('Error generating grocery list:', error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new Error('Failed to generate grocery list. Please check your connection.');
    }
};


export const generateSearchResults = async (recipeName: string): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/recigo/generate-search-results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipeName: recipeName
            })
        });

        if (!response.ok) {
            throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<string[]> = await response.json();

        if (!data.success || !data.data) {
            throw new Error(data.error || 'Failed to generate search results');
        }

        return data.data;
    } catch (error) {
        console.error('Error generating search results:', error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new Error('Failed to generate search results. Please check your connection.');
    }
};
