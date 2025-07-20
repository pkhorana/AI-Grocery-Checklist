//backend/routes/groceryList.ts
import express, { Request, Response } from 'express';
import { generateGroceryList } from '../services/openaiService';
import { ApiResponse, GroceryList } from '../types/index';

const router = express.Router();

router.post('/generate-grocery-list', async (req: Request, res: Response) => {
    try {
        const { recipeName, numOfServings } = req.body;
    
        if (!recipeName || numOfServings <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Recipe name and number of servings are required.',
                data: null
            });
        }

        const groceryList = await generateGroceryList(recipeName, numOfServings);

        res.json({
            success: true,
            data: groceryList,
        });
    } catch (error) {
        console.error('Error generating grocery list:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
});

export default router;