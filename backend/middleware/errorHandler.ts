// backend/middleware/errorHandler.ts
import {Request, Response, NextFunction} from 'express';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log the error for debugging purposes
  console.error('Error occurred:', error);

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
    ?
      'Internal Server Error'
    : error.message
  });
};
// Ensure the errorHandler is used after all routes