//backend/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recipeRoutes from './routes/groceryList';
import searchRoutes from './routes/searchResults';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/recigo', recipeRoutes, searchRoutes);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
    res.json({status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
})