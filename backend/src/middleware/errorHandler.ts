import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { name: 'CastError', message, status: 404 };
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = { name: 'MongoError', message, status: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = { name: 'ValidationError', message, status: 400 };
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const message = err.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    error = { name: 'ZodError', message, status: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { name: 'JsonWebTokenError', message, status: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { name: 'TokenExpiredError', message, status: 401 };
  }

  res.status(error.status || error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};
