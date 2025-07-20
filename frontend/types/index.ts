//frontend/types/index.ts

export interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
}

export interface GroceryItem {
    name: string;
    quantity: string;
    category?: string;
}

export interface GroceryCategory {
    [categoryName: string]: GroceryItem[];
}

export interface GroceryList {
    ingredients: string[];
    grocery_list: GroceryCategory;
    assumptions: string[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}