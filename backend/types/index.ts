//backend/types/index.ts

export interface GroceryItem {
    name: string;
    quantity: string;
}

export interface GroceryCategory {
    [categoryName: string]: GroceryItem[];
}

export interface GroceryList {
    ingredients: string[];
    grocery_list: GroceryCategory;
    assumptions: string[];
}

export interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
