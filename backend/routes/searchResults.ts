//backend/routes/groceryList.ts
import express, { Request, Response } from 'express';
import { generateGroceryList, generateSearchResults } from '../services/openaiService';
import { ApiResponse, GroceryList } from '../types/index';

const router = express.Router();

router.post('/generate-search-results', async (req: Request, res: Response) => {
    try {
        const { recipeName } = req.body;
    
        if (!recipeName) {
            return res.status(400).json({
                success: false,
                message: 'Recipe name is required.',
                data: null
            });
        }

        const groceryList = await generateSearchResults(recipeName);

        res.json({
            success: true,
            data: groceryList,
        });
    } catch (error) {
        console.error('Error generating search results:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
});

export default router;
